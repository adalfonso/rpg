import { Vector } from "excalibur";
import { MenuRenderConfig } from "./types";
import { SubMenu } from "../SubMenu";

/**
 * Draw the battle menu
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
  _resolution: Vector,
  config: MenuRenderConfig<T>,
  menu: SubMenu<T>
) {
  const { font } = config;
  ctx.save();
  ctx.font = `${font.size}px ${font.family}`;

  const tile_size = new Vector(font.size * 6, font.size * 2);
  const tile_padding = new Vector((font.size * 2) / 3, 0);
  const base_position = new Vector(
    offset.x - (tile_size.x + tile_padding.x) * menu.items.length,
    offset.y + tile_size.y
  );

  menu.items.forEach((item, index) => {
    const position = new Vector(tile_size.x + tile_padding.x, 0)
      .scale(index + 1)
      .add(base_position);

    item.draw(ctx, position, _resolution, config);
  });

  ctx.restore();
}
