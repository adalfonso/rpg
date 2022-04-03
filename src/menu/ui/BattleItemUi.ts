import Vector from "@/physics/math/Vector";
import { MenuItem } from "../MenuItem";
import { MenuRenderConfig } from "./types";

/**
 * Draw the battle menu item
 *
 * @param ctx canvas context
 * @param offset render position offset
 * @param resolution render resolution
 * @param config settings and functions used to render
 * @param item the menu item to draw
 */
export function render<T>(
  ctx: CanvasRenderingContext2D,
  offset: Vector,
  _resolution: Vector,
  config: MenuRenderConfig<T>,
  item: MenuItem<T>
) {
  const { font, logic } = config;
  const tile_size = new Vector(font.size * 6, font.size * 2);

  const is_selected = logic.isSelected(item);

  ctx.fillStyle = font.background_color;

  if (is_selected) {
    ctx.fillStyle = font.border_color;
    ctx.strokeRect(offset.x, offset.y, tile_size.x, tile_size.y);
  }

  ctx.fillRect(offset.x, offset.y, tile_size.x, tile_size.y);
  ctx.fillStyle = font.color;

  ctx.save();

  applyHighlight(ctx, item, config);

  const textOffset = new Vector(4, 4 + 20);

  ctx.fillText(
    item.displayAs,
    offset.x + textOffset.x,
    offset.y + textOffset.y
  );

  ctx.restore();

  if (is_selected && item.menu) {
    item.menu.items.forEach((sub_item, index) => {
      ctx.save();

      applyHighlight(ctx, sub_item, config);

      const subOffset = new Vector(0, 18 * (index + 1) + 32);

      ctx.fillText(
        sub_item.displayAs,
        offset.x + subOffset.x,
        offset.y + subOffset.y
      );
      ctx.restore();
    });
  }
}

/**
 * Apply text highlighting to the menu option when necessary
 *
 * @param ctx render context
 * @param item menu item
 * @param config settings and functions used to render
 */
const applyHighlight = <T>(
  ctx: CanvasRenderingContext2D,
  item: MenuItem<T>,
  config: MenuRenderConfig<T>
) => {
  const { font, logic } = config;
  if (!logic.isCurrentOption(item)) {
    return;
  }

  ctx.shadowOffsetX = font.shadow_offset.x;
  ctx.shadowOffsetY = font.shadow_offset.y;
  ctx.shadowBlur = font.shadow_blur;
  ctx.shadowColor = font.highlight_color;
};
