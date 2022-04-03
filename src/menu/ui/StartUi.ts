import Vector from "@/physics/math/Vector";
import { SubMenu } from "../SubMenu";
import { MenuRenderConfig } from "./types";

/**
 * Draw the start menu
 *
 * @param ctx canvas context
 * @param offset render position offset
 * @param resolution render resolution
 * @param config settings and functions used to render
 * @param menu start sub menu
 */
export function render<T>(
  ctx: CanvasRenderingContext2D,
  offset: Vector,
  resolution: Vector,
  config: MenuRenderConfig<T>,
  menu: SubMenu<T>
) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, .85)";
  ctx.fillRect(offset.x, offset.y, resolution.x, resolution.y);
  ctx.fillStyle = "#FFF";
  ctx.textAlign = "center";

  menu.items.forEach((item, i) => {
    item.draw(
      ctx,
      offset.plus(new Vector(0, 200 + 150 * i)),
      resolution,
      config
    );
  });

  ctx.restore();
}
