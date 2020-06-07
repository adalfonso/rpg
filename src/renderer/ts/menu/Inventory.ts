import Item from "@/item/Item";
import Menu from "./Menu";
import MissingDataError from "@/error/MissingDataError";
import StateManager from "@/state/StateManager";
import TextBuffer from "@/ui/TextBuffer";
import Vector from "@common/Vector";
import Weapon from "@/combat/strategy/Weapon";
import WeaponFactory from "@/combat/strategy/WeaponFactory";
import { Drawable, Eventful, CallableMap } from "@/interfaces";

/**
 * Template for a menu option
 */
type MenuOption = {
  type: string;
  displayAs: string;
  menu: any[];
};

/**
 * Main font size
 */
const TEXT_SIZE = 24;

/**
 * Secondary font size
 */
const SUBTEXT_SIZE = 16;

/**
 * A menu for managing things such as items and equipment
 */
class Inventory extends Menu implements Eventful, Drawable {
  /**
   * Create an Inventory instance
   *
   * @param menu - menu options
   */
  constructor(menu: MenuOption[]) {
    super(menu);

    this.resolveState(`inventory`);
  }

  /**
   * Get current state of the inventory for export to a state manager
   */
  get state(): object {
    return {
      menu: {
        item: this._getSubMenu("item").map((i: Item) => i.type),
        weapon: this._getSubMenu("weapon").map((i: Item) => i.type),
        armor: this._getSubMenu("armor").map((i: Item) => i.type),
        special: this._getSubMenu("special").map((i: Item) => i.type),
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
    menu = this.menu
  ) {
    if (!this.active) {
      return;
    }

    let isMainMenu = menu === this.menu;
    let margin = new Vector(60, isMainMenu ? 90 : 0);

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
    let widestText = this.getWidestMenuDescription(menu);
    let textWidth = ctx.measureText(widestText).width;
    ctx.restore();

    // Render each menu item
    menu.forEach((option, index) => {
      // Offset all options after the first option
      let spacing = index ? TEXT_SIZE * 2 : 0;

      /**
       * Make the assumption that this.selected with a length of two consists of
       * a menu and one of its constituents. If this is the case, we want to
       * draw the details of the contituent.
       */
      const showDetails =
        option === this.currentOption && this.selected.length === 2;

      ctx.translate(0, spacing);

      ctx.save();

      let detailSize;

      if (showDetails) {
        let offset = new Vector(-2, -TEXT_SIZE);

        detailSize = this.drawDetails(ctx, offset, resolution, option);

        // Move menu option a little bit away from the border
        ctx.translate(10, 0);
      }

      // Render the menu option text
      this.drawOptionText(ctx, new Vector(0, 0), resolution, option);

      // Account for height of equipable menu on next menu item
      if (showDetails) {
        ctx.translate(0, detailSize.y - TEXT_SIZE);
      }

      // Render sub-menu
      if (this.selected.includes(option) && option.menu) {
        let offset = new Vector(textWidth, 0);
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
    option: Weapon
  ) {
    // y-value is not known until the description renders
    let descriptionSize = new Vector(400, Infinity);

    const isEquipped = option.isEquipped ?? false;
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
    option: MenuOption
  ) {
    let isSelected = this.selected.includes(option);
    let isMainSelection = option === this.currentOption;
    let text = this.getOptionDescription(option);

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

    let buffer = new TextBuffer(text);

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
  private getWidestMenuDescription(menu: MenuOption[]): string {
    return menu.reduce((widestMenuText, option) => {
      let description = this.getOptionDescription(option);

      return widestMenuText.length > description.length
        ? widestMenuText
        : description;
    }, "");
  }

  /**
   * Get the description of a MenuOption
   *
   * @param option - option to get description for
   *
   * @return description of the option
   */
  private getOptionDescription(option: MenuOption): string {
    let subMenuCount = option.menu?.length ?? "";
    subMenuCount = subMenuCount ? ` (${subMenuCount})` : "";

    return option.displayAs + subMenuCount;
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
    let parent = super.register();

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
        let item = e.detail?.item;

        if (!item) {
          throw new MissingDataError(
            `Inventory unable to detect item on "item.obtain: event.`
          );
        }

        this.store(new Item(item.type));
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
      menu.push(new WeaponFactory().createStrategy(item.type));
    } else {
      menu.push(item);
    }

    this.updateState();
  }

  /**
   * Lookup a submenu by its type
   *
   * @param type - the type of the submenu
   *
   * @return the submenu
   */
  private _getSubMenu(type: string): any[] {
    return this.menu.filter((subMenu) => {
      return subMenu.type === type;
    })[0]?.menu;
  }

  /**
   * Resolve the current state of the inventory in comparison to the game state
   *
   * @param ref - reference to where in the state the inventory is stored
   *
   * @return inventory data as stored in the state
   */
  private resolveState(ref: string): any {
    const state = StateManager.getInstance();

    let stateManagerData = state.get(ref);

    if (stateManagerData === undefined) {
      state.mergeByRef(ref, this.state);
      return state.get(ref);
    }

    ["item", "weapon", "armor", "ability"].forEach((menuType) => {
      let subMenu = stateManagerData?.menu?.[menuType] ?? [];

      subMenu.forEach((item: any) => {
        if (this._getSubMenu(menuType)) {
          this.store(new Item(item));
        }
      });
    });

    const equipped = state.get("player.equipped");

    if (equipped) {
      this._getSubMenu("weapon").forEach((weapon: Weapon) => {
        if (weapon.type === equipped) {
          weapon.equip();
        }
      });
    }

    return stateManagerData;
  }

  /**
   * Update the inventory in the state
   */
  private updateState() {
    let state = StateManager.getInstance();
    state.remove("inventory");
    state.mergeByRef("inventory", this.state);
  }

  /**
   * Equip the currently selected option
   */
  private equipCurrentOption() {
    if (!(this.currentOption instanceof Weapon)) {
      return;
    }

    let menu = this.selected.slice(-2).shift();

    menu.menu.forEach((option: any) => {
      if (option === this.currentOption) {
        option.equip();
      }
    });
  }
}

export default Inventory;
