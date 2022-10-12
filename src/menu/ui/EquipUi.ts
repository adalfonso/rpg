import { vec, Vector } from "excalibur";

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

  const menu_padding_unrounded = new Vector(font.size, font.size).scale(0.5);

  const menu_padding = vec(
    Math.round(menu_padding_unrounded.x),
    Math.round(menu_padding_unrounded.y)
  );

  const title_offset = offset.add(menu_padding);

  ctx.font = `${font.size}px ${font.family}`;
  ctx.fillText("Equip to player:", title_offset.x, title_offset.y);

  menu.items.forEach((item, index) => {
    const row_offset = new Vector(0, (index + 1) * 2 * font.size);
    item.draw(
      ctx,
      offset.add(menu_padding).add(row_offset),
      resolution,
      config
    );
  });
}
