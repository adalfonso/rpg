import Item from "@/item/Item";
import MissingDataError from "@/error/MissingDataError";
import StateManager from "@/state/StateManager";
import TextBuffer from "@/ui/dialogue/TextBuffer";
import Vector from "@common/Vector";
import Weapon from "@/combat/strategy/Weapon";
import WeaponFactory from "@/combat/strategy/WeaponFactory";
import { BaseMenuItemTemplate as Base } from "./menus";
import { Drawable } from "@/interfaces";
import { EventType } from "@/EventBus";
import { InventoryState, isInventoryState } from "@/state/InventoryState";
import { Menu } from "./Menu";
import { MenuItem } from "./MenuItem";
import { SubMenu } from "./SubMenu";
type InventoryItem = Item | Weapon;

const isInventoryItem = (input: unknown): input is InventoryItem =>
  input instanceof Item || input instanceof Weapon;

export interface InventoryMenuItem extends Base {
  equipable?: boolean;
}

/** Main font size */
const TEXT_SIZE = 24;

/** Secondary font size */
const SUBTEXT_SIZE = 16;

/** A menu for managing things such as items and equipment */
export class Inventory extends Menu<InventoryMenuItem> implements Drawable {
  /**
   * Create an Inventory instance
   *
   * @param menu - menu options
   */
  constructor(protected menu: SubMenu<InventoryMenuItem>) {
    super(menu);

    this.resolveState(`inventory`);
  }

  /** Get current state of the inventory for export to a state manager */
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
   * @param menu       - target menu
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector,
    menu = this._menu
  ) {
    if (!this.active) {
      return;
    }

    const is_main_menu = menu === this._menu;
    const margin = new Vector(60, is_main_menu ? 90 : 0);

    ctx.save();
    ctx.translate(offset.x, offset.y);

    // Draw background under main menu only
    if (is_main_menu) {
      ctx.fillStyle = "#555";
      ctx.fillRect(offset.x, offset.y, resolution.x, resolution.y);
      ctx.fillStyle = "#EEE";
      ctx.textAlign = "left";
    }

    ctx.translate(margin.x, margin.y);

    // Calculate max width of menu
    ctx.save();
    ctx.font = `${TEXT_SIZE}px Minecraftia`;
    const widest_text = this.getWidestMenuDescription(menu);
    const text_width = ctx.measureText(widest_text).width;
    ctx.restore();

    // Render each menu item
    menu.items.forEach((option, index) => {
      // Offset all options after the first option
      const spacing = index ? TEXT_SIZE * 2 : 0;
      const { source } = option;

      const is_sub_menu_item =
        this._isCurrentOption(option) && this.selected.length === 2;

      ctx.translate(0, spacing);
      ctx.save();

      if (is_sub_menu_item && isInventoryItem(source)) {
        const offset = new Vector(-2, -TEXT_SIZE);
        const detail_size = this.drawDetails(ctx, offset, resolution, source);

        // Move menu option a little bit away from the border
        ctx.translate(10, 0);

        // Render the menu option text
        this.drawOptionText(ctx, Vector.empty(), resolution, option);

        // Account for height of equipable menu on next menu item
        ctx.translate(0, detail_size.y - TEXT_SIZE);
      } else {
        this.drawOptionText(ctx, Vector.empty(), resolution, option);
      }

      // Render sub-menu
      if (this.selected.includes(option) && option.menu) {
        const offset = new Vector(text_width, 0);

        this.draw(ctx, offset, resolution, option.menu);
      }
    });

    ctx.restore();
  }

  /**
   * Handle drawing of the detail panel
   *
   * @param ctx         - render context
   * @param offset      - render position offset
   * @param _resolution - render resolution
   * @param option      - target option
   */
  private drawDetails(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector,
    option: InventoryItem
  ) {
    // y-value is not known until the description renders
    const description_size = new Vector(400, Infinity);
    const is_equipped = "isEquipped" in option ? option.isEquipped : false;
    const padding = new Vector(16, 16);
    const sprite_size = new Vector(64, 64);
    const sprite_padding = new Vector(16, 8);
    const description_padding = new Vector(0, 8);
    const equipped_indicator_height = is_equipped
      ? SUBTEXT_SIZE + sprite_padding.y
      : 0;

    description_size.y = this.drawSubtext(
      ctx,
      offset.plus(padding).plus(description_padding),
      description_size,
      option.description ?? "Description not found."
    );

    const equipped_indicator = "Equipped";

    ctx.save();
    ctx.font = `${SUBTEXT_SIZE}px Minecraftia`;
    const equipped_indicator_width = ctx.measureText(equipped_indicator).width;
    ctx.restore();

    const width =
      description_size.x +
      padding.x * 2 +
      Math.max(sprite_size.x, equipped_indicator_width) +
      sprite_padding.x;

    const height =
      Math.max(
        description_size.y,
        sprite_size.y + sprite_padding.y + equipped_indicator_height
      ) +
      padding.y * 2;

    const size = new Vector(width, height);

    this.drawBox(ctx, offset, size);

    const sprite_offset = new Vector(
      size.x - sprite_size.x - padding.x,
      padding.y + sprite_padding.y
    ).plus(offset);

    option.draw(ctx, sprite_offset, sprite_size);

    if (is_equipped) {
      const text_size = new Vector(equipped_indicator_width, SUBTEXT_SIZE);
      const equipped_indicator_offset = offset
        .plus(size)
        .minus(text_size)
        .minus(padding);

      this.drawSubtext(
        ctx,
        equipped_indicator_offset,
        resolution,
        equipped_indicator
      );
    }

    return size;
  }

  /**
   * Draw a box on the inventory
   *
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
   */
  private drawBox(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(offset.x, offset.y, resolution.x, resolution.y);
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw main text type on the inventory
   *
   * @param ctx         - render context
   * @param offset      - render position offset
   * @param _resolution - render resolution
   * @param option      - target option
   */
  private drawOptionText(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    _resolution: Vector,
    option: MenuItem<InventoryMenuItem>
  ) {
    const is_selected = this.selected.includes(option);
    const is_main_selection = this._isCurrentOption(option);
    const text = this.getOptionDescription(option);

    if (is_selected) {
      ctx.font = `bold ${TEXT_SIZE}px Minecraftia`;
      ctx.shadowColor = "#000";
      ctx.shadowOffsetY = 4;
    } else {
      ctx.font = `${TEXT_SIZE}px Minecraftia`;
    }

    if (is_main_selection) {
      ctx.shadowColor = "#0AA";
    }

    ctx.fillText(text, offset.x, offset.y);
    ctx.restore();
  }

  /**
   * Draw the secondary type text on the inventory
   *
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - container for the text
   * @param text       - text to draw
   *
   * @return amount of height consumed
   */
  private drawSubtext(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector,
    text: string
  ) {
    ctx.save();

    ctx.font = `${SUBTEXT_SIZE}px Minecraftia`;
    ctx.shadowColor = "#000";

    const buffer = new TextBuffer(text);
    const SPACING_MODIFIER = 0.4;
    const LINE_HEIGHT = Math.ceil((1 + SPACING_MODIFIER) * SUBTEXT_SIZE);

    buffer.fill(ctx, resolution).forEach((text, index) => {
      // Offset by an extra line due to text being drawn from bottom left corner
      ctx.fillText(text, offset.x, offset.y + LINE_HEIGHT * (index + 1));
    });

    ctx.restore();

    return LINE_HEIGHT * buffer.read().length;
  }

  /**
   * Get the widest option description in the menu
   *
   * @param menu - target menu
   *
   * @return widest description in the menu
   */
  private getWidestMenuDescription(menu: SubMenu<InventoryMenuItem>) {
    return menu.items.reduce((widest_text, option) => {
      const description = this.getOptionDescription(option);

      return widest_text.length > description.length
        ? widest_text
        : description;
    }, "");
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
      menu.push(new MenuItem(weapon));
    } else {
      menu.push(new MenuItem(item));
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
   * Get the description of a MenuOption
   *
   * @param option - option to get description for
   *
   * @return description of the option
   */
  private getOptionDescription(option: MenuItem<InventoryMenuItem>) {
    if (option.menu) {
      return `${option.displayAs} (${option.menu.items.length})`;
    }

    return option.displayAs;
  }

  /**
   * Resolve the current state of the inventory in comparison to the game state
   *
   * @param ref - reference to where in the state the inventory is stored
   *
   * @return inventory data as stored in the state
   */
  private resolveState(ref: string) {
    const state = StateManager.getInstance();
    const data = state.get(ref);

    if (data === undefined) {
      return state.mergeByRef(ref, this.getState());
    } else if (!isInventoryState(data)) {
      throw new Error("Invalid state resolution for Inventory Menu");
    }

    ["item", "weapon", "armor", "special"].forEach((menuType) => {
      if (!this._hasMenu(data)) {
        return;
      }

      const subMenu = data.menu[menuType as keyof InventoryState["menu"]];

      subMenu.forEach((ref) => {
        if (this._getSubMenu(menuType)) {
          this.store(new Item(ref));
        }
      });
    });

    const equipped_id = state.get("player.equipped");
    const weapons = this._getSubMenu("weapon");

    if (equipped_id && weapons !== undefined) {
      weapons.items
        .map(({ source }) => source)
        .filter(
          (source) => source instanceof Weapon && source.ref === equipped_id
        )
        .forEach((weapon) => (weapon as Weapon).equip());
    }

    return data;
  }

  /**
   * Get current state of the inventory
   *
   * @return current state of the milestone
   */
  private getState() {
    return this.state;
  }

  /** Update the inventory in the state */
  private updateState() {
    const state = StateManager.getInstance();
    state.remove("inventory");
    state.mergeByRef("inventory", this.state);
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

export default Inventory;
