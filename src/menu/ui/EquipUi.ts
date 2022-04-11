import Vector from "@/physics/math/Vector";

import { SubMenu } from "../SubMenu";
import { MenuRenderConfig } from "./types";

/**
 * Draw the equipper menu
 *
 * @param ctx canvas context
 * @param offset render position offset
 * @param resolution render resolution
 * @param config settings and functions used to render
 * @param menu equipper sub menu
 */
export function render<T>(
  ctx: CanvasRenderingContext2D,
  offset: Vector,
  resolution: Vector,
  config: MenuRenderConfig<T>,
  menu: SubMenu<T>
) {
  const { font } = config;

  const menu_padding = new Vector(font.size, font.size)
    .times(0.5)
    .apply(Math.round);

  const title_offset = offset.plus(menu_padding);

  ctx.font = `${font.size}px ${font.family}`;
  ctx.fillText("Equip to player:", title_offset.x, title_offset.y);

  menu.items.forEach((item, index) => {
    const row_offset = new Vector(0, (index + 1) * 2 * font.size);
    item.draw(
      ctx,
      offset.plus(menu_padding).plus(row_offset),
      resolution,
      config
    );
  });
}
