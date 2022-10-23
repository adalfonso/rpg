import * as ex from "excalibur";
import Item from "@/item/Item";
import MissingDataError from "@/error/MissingDataError";
import Weapon from "@/combat/strategy/Weapon";
import WeaponFactory from "@/combat/strategy/WeaponFactory";
import { BaseMenuItemTemplate as Base } from "./menus";
import { Drawable } from "@/interfaces";
import { Equipper } from "@/combat/Equipper";
import { EquipperFactory } from "@/combat/EquipperFactory";
import { EventType } from "@/event/EventBus";
import { InventoryState, isInventoryState } from "@schema/menu/InventorySchema";
import { Menu } from "./Menu";
import { MenuType } from "./types";
import { SubMenu } from "./SubMenu";
import { createConfig } from "./ui/MenuRenderConfigFactory";
import { createMenuItem, createSubMenu } from "./MenuFactory";
import { state } from "@/state/StateManager";

type InventoryItem = Item | Weapon;

export const isInventoryItem = (input: unknown): input is InventoryItem =>
  input instanceof Item || input instanceof Weapon;

export interface InventoryMenuItem extends Base {
  equipable?: boolean;
}

/** A menu for managing things such as items and equipment */
export class Inventory extends Menu<InventoryMenuItem> implements Drawable {
  /** Name reference of the menu */
  protected _name = "inventory";

  /**
   * @param _menu - menu options
   * @param _equipper - equipment manager ctor
   */
  constructor(
    protected _menu: SubMenu<InventoryMenuItem>,
    private _equipper: EquipperFactory
  ) {
    super(_menu);

    this._resolveState();
  }

  /** State lookup key */
  get state_ref() {
    return this._name;
  }

  /** Current data state */
  get state(): InventoryState {
    const def = { items: [] as Base[] };
    return {
      menu: {
        item: (this._getSubMenu("item") || def).items.map((i) => i.ref),
        weapon: (this._getSubMenu("weapon") || def).items.map((i) => i.ref),
        armor: (this._getSubMenu("armor") || def).items.map((i) => i.ref),
        special: (this._getSubMenu("special") || def).items.map((i) => i.ref),
      },
    };
  }

  /**
   * Draw Menu and all underlying entities
   *
   * @param ctx - 2d render context
   */
  public draw2d(ctx: CanvasRenderingContext2D) {
    if (!this.active) {
      return;
    }

    const config = createConfig(
      {
        font: {
          color: "#EEE",
          highlight_color: "#0AA",
          shadow_offset: new ex.Vector(0, 4),
        },
        menu: { background_color: "#555" },
        logic: {
          isSelected: this._isSelected.bind(this),
          getBadgeTitle: (menu) =>
            menu.source instanceof Weapon && menu.source.isEquipped
              ? "Equipped"
              : "",
        },
      },
      this
    );

    this._menu.draw(ctx, ex.Vector.Zero, this._render_resolution, config);
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    const parent = super.register();

    return {
      [EventType.Custom]: {
        "item.obtain": (e: CustomEvent) => {
          const item = e.detail?.item;

          if (!item) {
            throw new MissingDataError(
              `Inventory unable to detect item on "item.obtain: event.`
            );
          }

          this.store(new Item(item.ref));
        },
      },
      [EventType.Keyboard]: {
        keyup: (e: KeyboardEvent) => {
          parent[EventType.Keyboard].keyup(e);

          if (this.locked) {
            return;
          } else if (e.key === "i") {
            this.active ? this.close() : this.open();
          } else if (e.key === "Enter") {
            this._useCurrentItem();
          }
        },
      },
    };
  }

  /**
   * Store an item in the proper inventory submenu
   *
   * @param item - an item to store in the inventory
   */
  public store(item: Item) {
    const { category } = item;
    const menu = this._getSubMenu(category);

    if (!menu) {
      throw new Error(
        `Tried to store an item in inventory sub-menu ${category} but sub-menu does not exist`
      );
    }

    if (category === "weapon") {
      const weapon = new WeaponFactory().createStrategy(item.ref);
      const menu_item = createMenuItem<InventoryMenuItem>(MenuType.Inventory)(
        weapon
      );
      const equipper = this._equipper(weapon);
      const sub_menu = createSubMenu<Equipper>(MenuType.Equip)(equipper.menu);

      menu_item.overrideMenu(sub_menu);

      menu.push(menu_item);
    } else {
      menu.push(createMenuItem<InventoryMenuItem>(MenuType.Inventory)(item));
    }

    this.updateState();
  }

  /**
   * Lookup a submenu by its type
   *
   * @param ref - the type of the submenu
   *
   * @return the submenu
   */
  private _getSubMenu(ref: string) {
    return this._menu.items.filter((item) => item.ref === ref)[0].menu;
  }

  /**
   * Resolve the current state of the inventory in comparison to the game state
   *
   * @param ref - reference to where in the state the inventory is stored
   *
   * @return inventory data as stored in the state
   */
  private _resolveState() {
    const data = state().resolve(this, isInventoryState);

    for (const key of Object.keys(data.menu)) {
      data.menu[key].forEach((ref: string) => {
        if (this._getSubMenu(key)) {
          this.store(new Item(ref));
        }
      });
    }

    const weapons = this._getSubMenu("weapon");

    if (weapons === undefined) {
      return data;
    }

    state()
      .get("team")
      ?.forEach((member) => {
        const { type, equipped } = member;

        if (!equipped) {
          return;
        }

        const weapon_item = weapons.items.filter(
          (weapon) =>
            weapon.source instanceof Weapon && weapon.source.ref === equipped
        )[0];

        if (!weapon_item) {
          throw new MissingDataError(
            `Could not find weapon "${equipped}" in inventory for actor "${type}"`
          );
        }

        const equipper_item = weapon_item.menu?.items.filter(
          (equipper) => equipper.ref === type
        )[0];

        if (!equipper_item) {
          throw new MissingDataError(
            `Could not find equipper for weapon "${equipped}" and actor "${type}"`
          );
        }

        (equipper_item.source as unknown as Equipper).equip();
      });

    return data;
  }

  /** Update the inventory in the state */
  private updateState() {
    state().remove("inventory");
    state().mergeByRef("inventory", this.state);
  }

  /** Try to activate the currently selected item */
  private _useCurrentItem() {
    const { source } = this.currentOption;

    if (source instanceof Equipper) {
      return this._equipCurrentItem();
    }
  }

  private _equipCurrentItem() {
    const { source } = this.currentOption;

    if (!(source instanceof Equipper)) {
      return;
    }

    const parent = this.selected.slice(-2).shift();

    parent?.menu?.items?.forEach(({ source: current }) => {
      if (source === current) {
        source.equip();
      }
    });
  }
}
