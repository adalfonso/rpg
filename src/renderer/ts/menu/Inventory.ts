import Item from "@/item/Item";
import Menu from "./Menu";
import MissingDataError from "@/error/MissingDataError";
import StateManager from "@/state/StateManager";
import TextBuffer from "@/ui/TextBuffer";
import Vector from "@common/Vector";
import Weapon from "@/combat/Weapon";
import { Drawable, Eventful, CallableMap } from "@/interfaces";

/**
 * Template for a menu option
 *
 * @type {MenuOption}
 */
type MenuOption = {
  type: string;
  displayAs: string;
  menu: MenuOption[];
};

/**
 * The height of an equipable description box
 *
 * @const {number}
 */
const EQUIPABLE_HEIGHT = 100;

/**
 * Main font size
 *
 * @const {number}
 */
const TEXT_SIZE = 24;

/**
 * Secondary font size
 *
 * @const {number}
 */
const SUBTEXT_SIZE = 16;

/**
 * Inventory is a menu for managing things such as items and equipment.
 */
class Inventory extends Menu implements Eventful, Drawable {
  /**
   * Create an Inventory instance
   *
   * @param {MenuOption[]} menu Menu options
   */
  constructor(menu: MenuOption[]) {
    super(menu);

    this.resolveState(`inventory`);
  }

  /**
   * Get current state of the inventory for export to a state manager
   *
   * @return {object} Current state of the inventory
   */
  get state(): object {
    const getSubMenu = (type: string) =>
      this.menu.filter((subMenu: any) => subMenu.type === type)[0]?.menu ?? [];

    return {
      menu: {
        item: getSubMenu("item").map((i: Item) => i.type),
        weapon: getSubMenu("weapon").map((i: Item) => i.type),
        armor: getSubMenu("armor").map((i: Item) => i.type),
        special: getSubMenu("special").map((i: Item) => i.type),
      },
    };
  }

  /**
   * Draw Inventory and all underlying entities.
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   * @param {MenuOption[]}             menu       Target menu
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

      let isEquipable =
        option === this.currentOption &&
        this.selected.length > 1 &&
        this.selected.slice(-2).shift().equipable;

      ctx.translate(0, spacing);

      ctx.save();

      let equipableSize;

      if (isEquipable) {
        let offset = new Vector(-2, -TEXT_SIZE);

        equipableSize = this.drawEquipable(ctx, offset, resolution, option);

        // Move menu option a little bit away from the border
        ctx.translate(10, 0);
      }

      // Render the menu option text
      this.drawOptionText(ctx, new Vector(0, 0), resolution, option);

      // Account for height of equipable menu on next menu item
      if (isEquipable) {
        ctx.translate(0, equipableSize.y - TEXT_SIZE);
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
   * Handle drawing of the equipable screen
   *
   * @param {CanvasRenderingContext2D} ctx         Render context
   * @param {Vector}                   offset      Render position offset
   * @param {Vector}                   _resolution Render resolution
   * @param {Weapon}                   option      Target option
   */
  private drawEquipable(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector,
    option: Weapon
  ) {
    // y-value is not known until the description renders
    let descriptionSize = new Vector(400, Infinity);

    const isEquipped = option.isEquipped;
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
      option.description
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
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
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
   * @param {CanvasRenderingContext2D} ctx         Render context
   * @param {Vector}                   offset      Render position offset
   * @param {Vector}                   _resolution Render resolution
   * @param {MenuOption}               option      Target option
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
   * @param  {CanvasRenderingContext2D} ctx        Render context
   * @param  {Vector}                   offset     Render position offset
   * @param  {Vector}                   resolution Container for the text
   * @param  {string}                   text       Text to draw
   *
   * @return {number}                              Amount of height consumed
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
   * @param  {MenuOption} menu Target menu
   *
   * @return {string}          Widest description in the menu
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
   * @param  {MenuOption} option Option to get description for
   *
   * @return {string}            Description
   */
  private getOptionDescription(option: MenuOption): string {
    let subMenuCount = option.menu?.length ?? "";
    subMenuCount = subMenuCount ? ` (${subMenuCount})` : "";

    return option.displayAs + subMenuCount;
  }

  /**
   * Register events with the event bus
   *
   * @return {CallableMap} Events to register
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
   * @param {Item} item
   */
  public store(item: Item) {
    this.menu
      .filter((subMenu) => {
        return subMenu.type === item.category;
      })[0]
      .menu.push(item.category === "weapon" ? new Weapon(item.type) : item);

    this.updateState();
  }

  /**
   * Resolve the current state of the inventory in comparison to the game state
   *
   * @param  {string} ref Reference to where in the state the inventory is stored
   *
   * @return {object}     Inventory data as stored in the state
   */
  private resolveState(ref: string): any {
    const state = StateManager.getInstance();

    let stateManagerData = state.get(ref);

    if (stateManagerData === undefined) {
      state.mergeByRef(ref, this.state);
      return state.get(ref);
    }

    ["item", "weapon", "armor", "spell"].forEach((menuType) => {
      let subMenu = stateManagerData?.menu?.[menuType] ?? [];

      subMenu.forEach((item: any) => {
        let subMenu: any = this.menu.filter((subMenu) => {
          return subMenu.type === menuType;
        });

        if (!subMenu.length) {
          return;
        }

        let instance =
          menuType === "weapon" ? new Weapon(item) : new Item(item);

        subMenu[0].menu.push(instance);
      });
    });

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
