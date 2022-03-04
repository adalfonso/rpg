import { MenuItemTemplate } from "./menus";
import { SubMenu } from "./SubMenu";

export class MenuItem<T> {
  /** Internal menu reference */
  private _menu?: SubMenu<T>;

  /**
   * @param _template - original template reference
   */
  constructor(private _template: MenuItemTemplate<T>) {
    if (_template.menu !== undefined) {
      this._menu = new SubMenu(_template.menu);
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

  /** Generic type getter helper */
  get<K extends keyof T>(key: K): T[K] {
    return this._template[key];
  }
}
