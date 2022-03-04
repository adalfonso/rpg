import InvalidDataError from "@/error/InvalidDataError";
import { MenuGenerator, MenuTemplate } from "./menus";
import { MenuItem } from "./MenuItem";

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
}
