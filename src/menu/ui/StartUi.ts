import { Vector } from "excalibur";
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
  const { font } = config;
  ctx.save();
  ctx.fillStyle = config.menu.background_color;
  ctx.fillRect(offset.x, offset.y, resolution.x, resolution.y);
  ctx.fillStyle = font.color;
  ctx.textAlign = font.align;

  menu.items.forEach((item, i) => {
    const font_offset = new Vector(0, font.size * 4 * (i + 1));
    item.draw(ctx, offset.add(font_offset), resolution, config);
  });

  ctx.restore();
}
