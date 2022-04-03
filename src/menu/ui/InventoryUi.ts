import Vector from "@/physics/math/Vector";
import { SubMenu } from "../SubMenu";
import { MenuRenderConfig } from "./types";

/**
 * Draw the inventory
 *
 * @param ctx canvas context
 * @param offset render position offset
 * @param resolution render resolution
 * @param config settings and functions used to render
 * @param menu inventory sub menu
 */
export function render<T>(
  ctx: CanvasRenderingContext2D,
  offset: Vector,
  resolution: Vector,
  config: MenuRenderConfig<T>,
  menu: SubMenu<T>
) {
  const { font } = config;
  const is_main_menu = config.isMainMenu(menu);
  const margin = new Vector(60, is_main_menu ? 90 : 0);

  ctx.save();
  ctx.translate(offset.x, offset.y);

  // Draw background under main menu only
  if (is_main_menu) {
    ctx.fillStyle = config.background_color;
    ctx.fillRect(offset.x, offset.y, resolution.x, resolution.y);
    ctx.fillStyle = font.color;
    ctx.textAlign = "left";
  }

  ctx.translate(margin.x, margin.y);

  // Calculate max width of menu
  ctx.save();
  ctx.font = `${font.size}px ${font.family}`;
  const widest_text = getWidestMenuDescription(menu);
  const sub_menu_width = ctx.measureText(widest_text).width;
  ctx.restore();

  menu.items.forEach((item, index) => {
    item.draw(ctx, offset, resolution, {
      ...config,
      sub_menu_width,
      // Offset all options after the first option
      row_offset_y: index ? font.size * 2 : 0,
    });
  });

  ctx.restore();
}

/**
 * Get the widest option description in the menu
 *
 * @param menu - target menu
 *
 * @return widest description in the menu
 */
const getWidestMenuDescription = <T>(menu: SubMenu<T>) =>
  menu.items.reduce((widest, item) => {
    const description = item.menu_description;

    return widest.length > description.length ? widest : description;
  }, "");
