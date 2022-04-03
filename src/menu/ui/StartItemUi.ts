import Vector from "@/physics/math/Vector";
import { MenuItem } from "../MenuItem";
import { MenuRenderConfig } from "./types";

/**
 * Draw the start menu item
 *
 * @param ctx canvas context
 * @param offset render position offset
 * @param resolution render resolution
 * @param options settings and functions used to render
 * @param item the menu item to draw
 */
export function render<T>(
  ctx: CanvasRenderingContext2D,
  offset: Vector,
  resolution: Vector,
  config: MenuRenderConfig<T>,
  item: MenuItem<T>
) {
  const selected = config.isCurrentOption(item);
  const { font } = config;

  if (selected) {
    ctx.shadowColor = font.shadow_color;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    ctx.font = `bold ${font.size}px ${font.family}`;
  } else {
    ctx.font = `${font.size}px ${font.family}`;
  }

  ctx.fillText(
    selected ? "▶ " + item.displayAs : item.displayAs,
    resolution.x / 2,
    offset.y
  );
}
