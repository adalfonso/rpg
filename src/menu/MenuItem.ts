import Vector from "@/physics/math/Vector";
import { MenuItemRenderer, MenuRenderConfig } from "./ui/types";
import { MenuItemTemplate } from "./menus";
import { MenuType } from "./types";
import { SubMenu } from "./SubMenu";
import { createSubMenu } from "./MenuFactory";

/**
 * A single entry in a menu
 *
 * This class is essentially a universal adapter for various entities that serve
 * as items in a menu.
 */
export class MenuItem<T> {
  /** Internal menu reference */
  private _menu?: SubMenu<T>;

  /**
   * @param _template - original template reference
   * @param _menu_type - type of the overall (parent) menu
   * @param _renderer - used to draw the menu item
   */
  constructor(
    private _template: MenuItemTemplate<T>,
    private _menu_type: MenuType,
    private _renderer: MenuItemRenderer<T>
  ) {
    if (_template.menu !== undefined) {
      this._menu = createSubMenu(this._menu_type)(_template.menu);
    }
  }

  get menu() {
    return this._menu;
  }

  get ref() {
    return this._template.ref;
  }

  get displayAs() {
    return this._template.displayAs;
  }

  get source() {
    return this._template;
  }

  get menu_description() {
    if (!this.menu) {
      return this.displayAs;
    }

    return `${this.displayAs} (${this.menu.items.length})`;
  }

  /** Generic type getter helper */
  get<K extends keyof T>(key: K): T[K] {
    return this._template[key];
  }

  /**
   * Draw the menu item
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
    this._renderer(ctx, offset, resolution, options, this);
  }
}
