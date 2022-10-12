import { Vector } from "excalibur";
import { MenuRenderConfig } from "./types";
import { SubMenu } from "../SubMenu";
import { createConfig } from "./MenuRenderConfigFactory";

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
  const { font, logic } = config;
  const is_main_menu = logic.isMainMenu(menu);
  const margin = new Vector(60, is_main_menu ? 90 : 0);

  // Draw background under main menu only
  if (is_main_menu) {
    ctx.fillStyle = config.menu.background_color;
    ctx.fillRect(offset.x, offset.y, resolution.x, resolution.y);
    ctx.fillStyle = font.color;
    ctx.textAlign = font.align;
  }

  // Calculate max width of menu

  ctx.font = `${font.size}px ${font.family}`;
  const widest_text = getWidestMenuDescription(menu);
  const sub_menu_width = ctx.measureText(widest_text).width;

  menu.items.forEach((item, index) => {
    const item_menu_config = { sub_menu_width };
    const item_config = createConfig({ menu: item_menu_config }, config);
    const row_offset = new Vector(0, font.size * 2 * index);
    const new_offset = offset.add(margin).add(row_offset);

    const detail_offset =
      item.draw(ctx, new_offset, resolution, item_config) ?? Vector.Zero;

    offset = offset.add(detail_offset);
  });
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
