import Item from "@/item/Item";
import Menu from "./Menu";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import { Drawable, Eventful } from "@/interfaces";

/**
 * Inventory is a menu for managing things such as items and equipment.
 */
class Inventory extends Menu implements Eventful, Drawable {
  /**
   * Create an Inventory instance
   *
   * @param {any[]} menu Menu options
   */
  constructor(menu: any) {
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
   * TODO: The current implementation is hard to understand due to the nested
   * higher-order reductions. The goal here was to preserve the currently
   * selected option's index in each menu, sum them, and then use the count to
   * render each submenu horizontally-aligned with the selected option of the
   * previous menu they stem from. At some point it may make more sense to use
   * a series of Menu classes and render them separately, passing in a different
   * offset to each one accordingly.
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    if (!this.active) {
      return;
    }

    ctx.save();
    ctx.translate(-offset.x, -offset.y);
    ctx.fillStyle = "rgba(200, 200, 200, .96)";
    ctx.fillRect(0, 0, resolution.x, resolution.y);
    ctx.fillStyle = "#75A";
    ctx.textAlign = "left";

    // Render each menu
    this.selected.reduce((offsetIndexY, selectedMenuOption, menuIndex) => {
      // Get the menu that the current selection belongs to
      let currentMenu =
        menuIndex > 0 ? this.selected[menuIndex - 1].menu : this.menu;

      // Render each option in the current menu
      let selectedMenuOptionIndex = currentMenu.reduce(
        (selectedMenuOptionIndex, option, menuOptionIndex) => {
          let menuOptionPosition = new Vector(
            48 + 200 * menuIndex,
            48 + 48 * (menuOptionIndex + offsetIndexY + 1)
          );

          ctx.save();
          ctx.font = "24px Arial";

          if (option === this.currentOption) {
            ctx.shadowColor = "#75A";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;
            ctx.font = "bold 24px Arial";
          }

          ctx.fillText(
            option.description,
            menuOptionPosition.x,
            menuOptionPosition.y
          );
          ctx.restore();

          return (
            selectedMenuOptionIndex +
            (option === selectedMenuOption ? menuOptionIndex : 0)
          );
        },
        0
      );

      return offsetIndexY + selectedMenuOptionIndex;
    }, 0);

    ctx.restore();
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
