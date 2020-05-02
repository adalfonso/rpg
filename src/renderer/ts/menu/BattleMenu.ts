import Menu from "./Menu";
import Vector from "@common/Vector";
import { Drawable, Eventful } from "@/interfaces";

/**
 * A BattleMenu is used by the player to access battle-level fixtures such as
 * items, attack, and spells.
 */
class BattleMenu extends Menu implements Eventful, Drawable {
  /**
   * Draw BattleMenu and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    _resolution: Vector
  ) {
    ctx.save();
    ctx.font = "12px Arial";

    let tileSize = new Vector(72, 24);
    let tilePadding = new Vector(8, 0);

    ctx.translate(
      offset.x - (tileSize.x + tilePadding.x) * this.menu.length,
      offset.y + tileSize.y
    );

    this.menu.forEach((option) => {
      let isSelected = option === this.selected[0];

      ctx.translate(tileSize.x + tilePadding.x, 0);

      ctx.font = "12px Arial";
      ctx.fillStyle = "#fff";

      if (option === this.selected[0]) {
        ctx.fillStyle = "#ddd";
        ctx.strokeRect(0, 0, tileSize.x, tileSize.y);
      }

      if (option === this.currentOption) {
        ctx.font = "bold 12px Arial";
      }

      ctx.fillRect(0, 0, tileSize.x, tileSize.y);
      ctx.fillStyle = "#000";
      ctx.fillText(option.type, 4, 4 + 12);

      if (isSelected && option.menu?.length) {
        option.menu.forEach((subOption, index) => {
          ctx.save();

          if (subOption === this.currentOption) {
            ctx.font = "bold 12px Arial";
          } else {
            ctx.font = "12px Arial";
          }

          let desc = subOption.name ?? subOption;

          ctx.translate(0, 18 * (index + 1) + 6);
          ctx.fillText(desc, 0, 16);
          ctx.restore();
        });
      }
    });

    ctx.restore();
  }

  public register(): object {
    return {
      keyup: (e) => {
        if (this.locked) {
          return;
        }

        let menu = this.currentMenu;
        let option = this.currentOption;

        switch (e.key) {
          case "ArrowDown":
            if (this.hasSubMenu()) {
              this.select();
            } else if (this.selected.length > 1) {
              this.next();
            }
            break;

          case "ArrowUp":
            if (option === menu[0]) {
              this.back();
            } else if (this.selected.length > 1) {
              this.previous();
            }
            break;

          case "ArrowLeft":
            if (this.selected.length === 1) {
              this.previous();
            }
            break;

          case "ArrowRight":
            if (this.selected.length === 1) {
              this.next();
            }
            break;

          case "Enter":
            if (typeof option.use === "function") {
              option.use();
            }
            break;
        }
      },
    };
  }
}

export default BattleMenu;
