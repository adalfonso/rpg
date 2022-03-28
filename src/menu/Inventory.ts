import Item from "@/item/Item";
import MissingDataError from "@/error/MissingDataError";
import Vector from "@/physics/math/Vector";
import Weapon from "@/combat/strategy/Weapon";
import WeaponFactory from "@/combat/strategy/WeaponFactory";
import { BaseMenuItemTemplate as Base } from "./menus";
import { Drawable } from "@/interfaces";
import { EventType } from "@/event/EventBus";
import { InventoryState, isInventoryState } from "@schema/menu/InventorySchema";
import { Menu } from "./Menu";
import { MenuItem } from "./MenuItem";
import { SubMenu } from "./SubMenu";
import { state } from "@/state/StateManager";

type InventoryItem = Item | Weapon;

const isInventoryItem = (input: unknown): input is InventoryItem =>
  input instanceof Item || input instanceof Weapon;

export interface InventoryMenuItem extends Base {
  equipable?: boolean;
}

/** A menu for managing things such as items and equipment */
export class Inventory extends Menu<InventoryMenuItem> implements Drawable {
  /** Name reference of the menu */
  protected _name = "inventory";

  /**
   * @param menu - menu options
   */
  constructor(protected menu: SubMenu<InventoryMenuItem>) {
    super(menu);

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
   * Draw Inventory and all underlying entities.
   *
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    if (!this.active) {
      return;
    }

    const render_options = {
      font: {
        color: "#EEE",
        shadow_color: "#000",
        highlight_color: "#0AA",
        size: 24,
        subtext_size: 16,
        family: "Minecraftia",
      },
      background_color: "#555",
      default_menu: this.menu,
      isMainMenu: (menu: SubMenu<InventoryMenuItem>) => menu === this._menu,

      isCurrentOption: (item: MenuItem<InventoryMenuItem>) =>
        this._isCurrentOption(item),

      isSelected: (item: MenuItem<InventoryMenuItem>) => this._isSelected(item),

      isSubMenuItem: (item: MenuItem<InventoryMenuItem>) =>
        this._isCurrentOption(item) && this.selected.length === 2,

      getBadgeTitle: (menu: MenuItem<InventoryMenuItem>) =>
        menu.source instanceof Weapon && menu.source.isEquipped
          ? "Equipped"
          : "",

      shouldDrawDetails: isInventoryItem,
    };

    this.menu.draw(ctx, offset, resolution, render_options);
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
            this.equipCurrentOption();
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

      menu.push(new MenuItem<InventoryMenuItem>(weapon));
    } else {
      menu.push(new MenuItem<InventoryMenuItem>(item));
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

    const equipped_id = state().get("player.equipped");
    const weapons = this._getSubMenu("weapon");

    if (equipped_id && weapons !== undefined) {
      weapons.items
        .map(({ source }) => source)
        .filter(
          (source): source is Weapon =>
            source instanceof Weapon && source.ref === equipped_id
        )
        .forEach((weapon) => weapon.equip());
    }

    return data;
  }

  /** Update the inventory in the state */
  private updateState() {
    state().remove("inventory");
    state().mergeByRef("inventory", this.state);
  }

  /** Equip the currently selected option */
  private equipCurrentOption() {
    const { source } = this.currentOption;

    if (!(source instanceof Weapon)) {
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
