import Menu from "./Menu";
import Vector from "@/Vector";
import { Drawable, Eventful } from "@/interfaces";
import Weapon from "@/item/Weapon";

/**
 * Types allowed in the inventory menu
 */
type InventoryType = Weapon;

/**
 * Inventory is a menu for managing things such as items and equipment.
 */
class Inventory extends Menu implements Eventful, Drawable {
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
      },
    ];
  }

  /**
   * Store an item in the proper inventory submenu
   *
   * @param {InventoryType} item
   */
  public store(item: InventoryType) {
    this.menu
      .filter((submenu) => {
        return submenu.type === item.type;
      })[0]
      .menu.push(item);
  }
}

export default Inventory;
