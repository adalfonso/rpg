import InvalidDataError from "@/error/InvalidDataError";
import { MenuGenerator, MenuTemplate } from "./menus";
import { MenuItem } from "./MenuItem";
import Vector from "@/physics/math/Vector";
import { MenuRenderConfig } from "./ui/types";

/**
 * Type T represents a generic type for MenuItem. i.e. an extension of the
 * MenuItem type which may contain a submenu used to recursively nest additional
 * menus
 *
 * Type U is a secondary type used when the submenu contains non-MenuItems. It
 * is not always used. When it is used it may be some type that can be rendered
 * as a menu item such as a weapon. When it is not used, it will fallback to be
 * a menu item.
 */
export class SubMenu<T> {
  /** Main menu */
  private _menu: MenuItem<T>[] | MenuGenerator<T>;

  /**
   * @param menu - menu template
   */
  constructor(menu: MenuTemplate<T>) {
    this._menu =
      menu instanceof Function ? menu : menu.map((item) => new MenuItem(item));
  }

  get items() {
    if (this._menu instanceof Function) {
      return this._menu().map((item) => new MenuItem(item));
    }

    return this._menu;
  }

  /**
   * Add a new item to the menu
   *
   * @param item - item to add
   * @returns fluent
   */
  public push(item: MenuItem<T>) {
    if (this._menu instanceof Function) {
      throw new InvalidDataError("Cannot push an item into a dynamic sub menu");
    } else {
      this._menu = [...this._menu, item];
    }

    return this;
  }

  /**
   * Draw the sub menu
   *
   * @param ctx canvas context
   * @param offset render position offset
   * @param resolution render resolution
   * @param options settings and functions used to render
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector,
    options: MenuRenderConfig<T>
  ) {
    const { font } = options;
    const is_main_menu = options.isMainMenu(this);
    const margin = new Vector(60, is_main_menu ? 90 : 0);

    ctx.save();
    ctx.translate(offset.x, offset.y);

    // Draw background under main menu only
    if (is_main_menu) {
      ctx.fillStyle = options.background_color;
      ctx.fillRect(offset.x, offset.y, resolution.x, resolution.y);
      ctx.fillStyle = font.color;
      ctx.textAlign = "left";
    }

    ctx.translate(margin.x, margin.y);

    // Calculate max width of menu
    ctx.save();
    ctx.font = `${font.size}px ${font.family}`;
    const widest_text = this._getWidestMenuDescription(this);
    const sub_menu_width = ctx.measureText(widest_text).width;
    ctx.restore();

    this.items.forEach((item, index) => {
      item.draw(ctx, offset, resolution, {
        ...options,
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
  private _getWidestMenuDescription(menu: SubMenu<T>) {
    return menu.items.reduce((widest, item) => {
      const description = item.menu_description;

      return widest.length > description.length ? widest : description;
    }, "");
  }
}
