import Menu from "./Menu";
import Vector from "@/Vector";
import { Drawable } from "@/interfaces";

export default class StartMenu extends Menu implements Drawable {
  constructor() {
    let menu = [
      {
        type: "start",
        description: "Press Enter to Start!",
        action: (menu) => {
          menu.close();
        },
      },
      {
        type: "load",
        description: "Load Saved State (doesn't work yet)",
        action: (menu) => {},
      },
    ];

    super(menu);
  }

  /**
   * Draw game and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector) {
    if (!this.active) {
      return false;
    }

    ctx.save();
    ctx.translate(-offset.x, -offset.y);
    ctx.fillStyle = "rgba(0, 0, 0, .85)";
    ctx.fillRect(0, 0, resolution.x, resolution.y);
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";

    this.menu.forEach((option, index) => {
      let current = this.menu[index];
      let selected = current === this.currentOption;

      if (selected) {
        ctx.shadowColor = "#FFF";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;
        ctx.font = "bold 42px Arial";
      } else {
        ctx.font = "42px Arial";
      }

      ctx.fillText(
        selected ? "▶ " + current.description : current.description,
        resolution.x / 2,
        (resolution.y / (this.menu.length - index)) * 0.5
      );
    });

    ctx.restore();
  }
}
