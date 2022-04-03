import Vector from "@/physics/math/Vector";
import { MenuItem } from "../MenuItem";
import { MenuRenderConfig } from "./types";

/**
 * Draw the start menu item
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
  resolution: Vector,
  config: MenuRenderConfig<T>,
  item: MenuItem<T>
) {
  const { font, logic } = config;
  const selected = logic.isCurrentOption(item);
  const font_style = `${font.size}px ${font.family}`;

  if (selected) {
    ctx.shadowColor = font.shadow_color;
    ctx.shadowOffsetX = font.shadow_offset.x;
    ctx.shadowOffsetY = font.shadow_offset.y;
    ctx.shadowBlur = font.shadow_blur;
    ctx.font = `bold ${font_style}`;
  } else {
    ctx.shadowColor = "transparent";
    ctx.font = font_style;
  }

  ctx.fillText(
    selected ? "▶ " + item.displayAs : item.displayAs,
    resolution.x / 2,
    offset.y
  );
}
