import Item from "@/item/Item";
import Menu from "./Menu";
import MissingDataError from "@/error/MissingDataError";
import StateManager from "@/state/StateManager";
import TextBuffer from "@/ui/TextBuffer";
import Vector from "@common/Vector";
import Weapon from "@/combat/strategy/Weapon";
import WeaponFactory from "@/combat/strategy/WeaponFactory";
import { BaseMenuItem } from "./menus";
import { Drawable, Eventful, CallableMap } from "@/interfaces";
import { InventoryState, isInventoryState } from "@/state/InventoryState";

type InventoryItem = Item | Weapon;

const isInventoryItem = (input: unknown): input is InventoryItem =>
  input instanceof Item || input instanceof Weapon;

export interface InventoryMenuItem extends BaseMenuItem<InventoryMenuOption> {
  equipable?: boolean;
}

type InventoryMenuOption = InventoryMenuItem | InventoryItem;

/** Main font size */
const TEXT_SIZE = 24;

/** Secondary font size */
const SUBTEXT_SIZE = 16;

/**
 * A menu for managing things such as items and equipment
 */
class Inventory
  extends Menu<InventoryMenuOption>
  implements Eventful, Drawable
{
  /**
   * Create an Inventory instance
   *
   * @param menu - menu options
   */
  constructor(protected menu: InventoryMenuItem[]) {
    super(menu);

    this.resolveState(`inventory`);
  }

  /**
   * Get current state of the inventory for export to a state manager
   */
  get state(): InventoryState {
    return {
      menu: {
        item: this._getSubMenu("item").map((i: Item) => i.ref),
        weapon: this._getSubMenu("weapon").map((i: Item) => i.ref),
        armor: this._getSubMenu("armor").map((i: Item) => i.ref),
        special: this._getSubMenu("special").map((i: Item) => i.ref),
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

    const isMainMenu = menu === this._menu;
    const margin = new Vector(60, isMainMenu ? 90 : 0);

    ctx.save();

    ctx.translate(offset.x, offset.y);

    // Draw background under main menu only
    if (isMainMenu) {
      ctx.fillStyle = "#555";
      ctx.fillRect(offset.x, offset.y, resolution.x, resolution.y);
      ctx.fillStyle = "#EEE";
      ctx.textAlign = "left";
    }

    ctx.translate(margin.x, margin.y);

    // Calculate max width of menu
    ctx.save();
    ctx.font = `${TEXT_SIZE}px Minecraftia`;
    const widestText = this.getWidestMenuDescription(menu);
    const textWidth = ctx.measureText(widestText).width;
    ctx.restore();

    // Render each menu item
    menu.forEach((option, index) => {
      // Offset all options after the first option
      const spacing = index ? TEXT_SIZE * 2 : 0;

      /**
       * This detects if an item/weapon is currently selected and is used to
       * render the menu differently. When an item/weapon is selected, the
       * "selected" stack will contain:
       * sub menu (e.g. weapons) => sub menu item (e.g. sword)
       *
       * There is also a type check that the current option is an item/weapon
       * and that was evaluated in the conditionals below because eslint wasn't
       * able to understand it evaluated outside.
       */
      const isInventorySubMenuItem =
        option === this.currentOption && this.selected.length === 2;

      ctx.translate(0, spacing);

      ctx.save();

      let detailSize;

      if (isInventorySubMenuItem && isInventoryItem(option)) {
        const offset = new Vector(-2, -TEXT_SIZE);

        detailSize = this.drawDetails(ctx, offset, resolution, option);

        // Move menu option a little bit away from the border
        ctx.translate(10, 0);
      }

      // Render the menu option text
      this.drawOptionText(ctx, new Vector(0, 0), resolution, option);

      // Account for height of equipable menu on next menu item
      if (isInventorySubMenuItem && isInventoryItem(option)) {
        ctx.translate(0, detailSize.y - TEXT_SIZE);
      }

      // Render sub-menu
      if (this.selected.includes(option) && "menu" in option) {
        const offset = new Vector(textWidth, 0);

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
    const descriptionSize = new Vector(400, Infinity);
    const isEquipped = "isEquipped" in option ? option.isEquipped : false;
    const padding = new Vector(16, 16);
    const spriteSize = new Vector(64, 64);
    const spritePadding = new Vector(16, 8);
    const descriptionPadding = new Vector(0, 8);
    const equippedIndicatorHeight = isEquipped
      ? SUBTEXT_SIZE + spritePadding.y
      : 0;

    descriptionSize.y = this.drawSubtext(
      ctx,
      offset.plus(padding).plus(descriptionPadding),
      descriptionSize,
      option.description ?? "Description not found."
    );

    const equippedIndicator = "Equipped";

    ctx.save();
    ctx.font = `${SUBTEXT_SIZE}px Minecraftia`;
    const equippedIndicatorWidth = ctx.measureText(equippedIndicator).width;
    ctx.restore();

    const width =
      descriptionSize.x +
      padding.x * 2 +
      Math.max(spriteSize.x, equippedIndicatorWidth) +
      spritePadding.x;

    const height =
      Math.max(
        descriptionSize.y,
        spriteSize.y + spritePadding.y + equippedIndicatorHeight
      ) +
      padding.y * 2;

    const size = new Vector(width, height);

    this.drawBox(ctx, offset, size);

    const spriteOffset = new Vector(
      size.x - spriteSize.x - padding.x,
      padding.y + spritePadding.y
    ).plus(offset);

    option.draw(ctx, spriteOffset, spriteSize);

    if (isEquipped) {
      const textSize = new Vector(equippedIndicatorWidth, SUBTEXT_SIZE);
      const equippedIndicatorOffset = offset
        .plus(size)
        .minus(textSize)
        .minus(padding);

      this.drawSubtext(
        ctx,
        equippedIndicatorOffset,
        resolution,
        equippedIndicator
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
    option: InventoryMenuOption
  ) {
    const isSelected = this.selected.includes(option);
    const isMainSelection = option === this.currentOption;
    const text = this.getOptionDescription(option);

    if (isSelected) {
      ctx.font = `bold ${TEXT_SIZE}px Minecraftia`;
      ctx.shadowColor = "#000";
      ctx.shadowOffsetY = 4;
    } else {
      ctx.font = `${TEXT_SIZE}px Minecraftia`;
    }

    if (isMainSelection) {
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
  ): number {
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
  private getWidestMenuDescription(menu: InventoryMenuOption[]): string {
    return menu.reduce((widestMenuText, option) => {
      const description = this.getOptionDescription(option);

      return widestMenuText.length > description.length
        ? widestMenuText
        : description;
    }, "");
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
    const parent = super.register();

    return {
      keyup: (e: KeyboardEvent) => {
        parent.keyup(e);

        if (this.locked) {
          return;
        } else if (e.key === "i") {
          this.active ? this.close() : this.open();
        } else if (e.key === "Enter") {
          this.equipCurrentOption();
        }
      },
      "item.obtain": (e: CustomEvent) => {
        const item = e.detail?.item;

        if (!item) {
          throw new MissingDataError(
            `Inventory unable to detect item on "item.obtain: event.`
          );
        }

        this.store(new Item(item.ref));
      },
    };
  }

  /**
   * Store an item in the proper inventory submenu
   *
   * @param item - an item to store in the inventory
   */
  public store(item: Item) {
    const menu = this._getSubMenu(item.category);

    if (item.category == "weapon") {
      menu.push(new WeaponFactory().createStrategy(item.ref));
    } else {
      menu.push(item);
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
    const filtered = this._menu.filter((subMenu) => {
      return subMenu.ref === ref;
    })[0];

    return "menu" in filtered ? filtered.menu : undefined;
  }

  /**
   * Get the description of a MenuOption
   *
   * @param option - option to get description for
   *
   * @return description of the option
   */
  private getOptionDescription(option: InventoryMenuOption): string {
    if ("menu" in option) {
      return `${option.displayAs} (${option.menu.length})`;
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
      if (this._hasMenu(data)) {
        const subMenu = data.menu[menuType as keyof InventoryState["menu"]];

        subMenu.forEach((ref) => {
          if (this._getSubMenu(menuType)) {
            this.store(new Item(ref));
          }
        });
      }
    });

    const equipped = state.get("player.equipped");

    if (equipped) {
      this._getSubMenu("weapon").forEach((weapon: Weapon) => {
        if (weapon.ref === equipped) {
          weapon.equip();
        }
      });
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
    if (!(this.currentOption instanceof Weapon)) {
      return;
    }

    const menu = this.selected.slice(-2).shift();

    if ("menu" in menu) {
      menu.menu.forEach((option: unknown) => {
        if (
          option === this.currentOption &&
          option["equip"] instanceof Function
        ) {
          option["equip"]();
        }
      });
    }
  }
}

export default Inventory;
