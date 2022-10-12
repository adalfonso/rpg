import InvalidDataError from "@/error/InvalidDataError";
import { Vector } from "excalibur";
import { MenuGenerator, MenuTemplate } from "./menus";
import { MenuItem } from "./MenuItem";
import { MenuRenderConfig, SubMenuRenderer } from "./ui/types";
import { MenuType } from "./types";
import { createMenuItem } from "./MenuFactory";

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
   * @param template - menu template
   * @param _menu_type - type of the overall (parent) menu
   * @param _renderer - used to draw the menu
   */
  constructor(
    template: MenuTemplate<T>,
    private _menu_type: MenuType,
    private _renderer: SubMenuRenderer<T>
  ) {
    this._menu =
      template instanceof Function
        ? template
        : template.map(createMenuItem(this._menu_type));
  }

  get items(): MenuItem<T>[] {
    if (this._menu instanceof Function) {
      return this._menu().map(createMenuItem(this._menu_type));
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
   * @param config settings and functions used to render
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector,
    config: MenuRenderConfig<T>
  ) {
    this._renderer(ctx, offset, resolution, config, this);
  }
}
