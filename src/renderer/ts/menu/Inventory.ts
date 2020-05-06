import Item from "@/item/Item";
import Menu from "./Menu";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import { Drawable, Eventful } from "@/interfaces";

/**
 * Template for a menu option
 *
 * @type {MenuOption}
 */
type MenuOption = {
  type: string;
  description: string;
  menu: MenuOption[];
};

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
    const getSubMenu = (type) =>
      this.menu.filter((subMenu) => subMenu.type === type)[0]?.menu ?? [];

    return {
      menu: {
        item: getSubMenu("item").map((i) => i.type),
        weapon: getSubMenu("weapon").map((i) => i.type),
        armor: getSubMenu("armor").map((i) => i.type),
        special: getSubMenu("special").map((i) => i.type),
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

    ctx.save();
    ctx.translate(-offset.x, -offset.y);

    let margin = new Vector(60, 0);

    // Initial render
    if (menu === this.menu) {
      ctx.fillStyle = "#555";
      ctx.fillRect(0, 0, resolution.x, resolution.y);
      ctx.fillStyle = "#EEE";
      ctx.textAlign = "left";
      margin = new Vector(60, 90);
    }

    ctx.translate(margin.x, margin.y);

    ctx.save();
    ctx.font = "24px Minecraftia";
    let widestText = this.getWidestMenuDescription(menu);
    let textWidth = ctx.measureText(widestText).width;
    ctx.restore();

    menu.forEach((option, index) => {
      let spacing = index ? 50 : 0;
      let isSelected = this.selected.includes(option);
      let isMainSelection = option === this.currentOption;

      ctx.translate(0, spacing);

      ctx.save();

      if (isSelected) {
        ctx.shadowColor = "#000";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.shadowBlur = 0;
        ctx.font = "bold 24px Minecraftia";
      } else {
        ctx.font = "24px Minecraftia";
      }

      if (isMainSelection) {
        ctx.shadowColor = "#0AA";
      }

      let text = this.getOptionDescription(option);

      ctx.fillText(text, 0, 0);
      ctx.restore();

      // Render sub-menu
      if (isSelected && option.menu) {
        let offset = new Vector(-textWidth, 0);
        this.draw(ctx, offset, resolution, option.menu);
      }
    });

    ctx.restore();
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

    return option.description + subMenuCount;
  }

  /**
   * Register events with the event bus
   *
   * @return {object} Events to register
   */
  public register(): object {
    return [
      super.register(),
      {
        keyup: (e) => {
          if (e.key === "i" && !this.locked) {
            this.active ? this.close() : this.open();
          }
        },
        "item.obtain": (e) => {
          let item = e.detail?.item;

          if (!item) {
            throw new Error(
              `Inventory unable to detect item on "item.obtain: event.`
            );
          }

          this.store(new Item(item.type));
        },
      },
    ];
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
      .menu.push(item);

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

      subMenu.forEach((item) => {
        let subMenu: any = this.menu.filter((subMenu) => {
          return subMenu.type === menuType;
        });

        if (!subMenu.length) {
          return;
        }

        subMenu[0].menu.push(new Item(item));
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
}

export default Inventory;
