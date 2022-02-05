import UnimplementedMethodError from "@/error/UnimplementMethodError";
import Vector from "@common/Vector";
import { BaseMenuItem } from "./menus";
import { Drawable, Eventful, Lockable, CallableMap } from "@/interfaces";
import { Empty } from "@/mixins";
import { Movable } from "@/Entity";
import { bus } from "@/EventBus";
import { lcFirst } from "@/util";

/** A visual UI that can be opened, closed, and traversed */
abstract class Menu<T extends BaseMenuItem<T>>
  extends Movable(Empty)
  implements Eventful, Drawable, Lockable
{
  /**
   * A stack of the currently selected menu options
   *
   * If the menu contains sub-menus, the stack will grow to store the menu path.
   */
  protected selected: (T | BaseMenuItem<T>)[];

  /** If the menu is locked */
  protected locked = false;

  /** If the menu is currently active */
  public active: boolean;

  /**
   * Create a Menu-based instance
   *
   * @param _menu - menu options
   * @param _position - menu position
   */
  constructor(
    protected _menu: T[],
    protected _position: Vector = new Vector(0, 0)
  ) {
    super();
    this.selected = [];
    this.selected.push(this._menu[0]);

    bus.register(this);
  }

  /** Get the current selected menu option */
  get currentOption() {
    return this.selected[this.selected.length - 1];
  }

  /** Get the current list of menu options being displayed. */
  get currentMenu() {
    return this.selected.length > 1
      ? this.selected[this.selected.length - 2].menu
      : this._menu;
  }

  /**
   * Draw Menu and all underlying entities
   *
   * @param _ctx        - render context
   * @param _offset     - render position offset
   * @param _resolution - render resolution
   *
   * @throws {UnimplementedMethodError} when child class doesn't implement draw
   */
  public draw(
    _ctx: CanvasRenderingContext2D,
    _offset: Vector,
    _resolution: Vector
  ) {
    throw new UnimplementedMethodError(
      `Submenu "${this.constructor.name}" must implement draw method.`
    );
  }

  /**
   * Register events with the event bus
   *
   * TODO: This menu is vertical orientation, with sub-classes left to override
   * how key codes are interpreted. This is bad design. Perhaps there should be
   * further abstractions for more generic sub-classes. Additionaly menus with
   * sub-menus may benefit from parsing the sub-menus as actual menu instances
   * instead of using an object literal.
   *
   * @return events to register
   */
  public register(): CallableMap {
    return {
      keyup: (e: KeyboardEvent) => {
        if (!this.active) {
          return;
        }

        if (e.key === "Escape") {
          return this.close();
        }

        switch (e.key) {
          case "ArrowRight":
          case "Enter":
            this.select();
            break;
          case "ArrowLeft":
          case "Backspace":
            this.back();
            break;
          case "ArrowUp":
            this.previous();
            break;
          case "ArrowDown":
            this.next();
            break;
        }
      },
    };
  }

  /** Open the menu */
  public open() {
    this.active = true;
    bus.emit(`menu.${lcFirst(this.constructor.name)}.open`);
  }

  /** Close the menu */
  public close() {
    this.selected = [this._menu[0]];
    this.active = false;
    bus.emit(`menu.${lcFirst(this.constructor.name)}.close`);
  }

  /**
   * Lock the menu
   *
   * @return if unlock was successful
   */
  public lock(): boolean {
    this.locked = true;

    return true;
  }

  /**
   * Unlock the menu
   *
   * @return if unlock was successful
   */
  public unlock(): boolean {
    this.locked = false;

    return true;
  }

  /** Completely remove the menu */
  public destroy() {
    if (this.active) {
      this.close();
    }

    bus.unregister(this);
  }

  /** Choose the currently selected menu option */
  protected select() {
    if (this.currentOption.menu?.length > 0) {
      this.selected.push(this.currentOption.menu[0]);
    }
  }

  /** Traverse back one sub menu in the menu tree or close the menu */
  protected back() {
    if (this.selected.length > 1) {
      this.selected.pop();
      return;
    }

    this.close();
  }

  /** Traverse back to the previous menu option within the same level */
  protected previous() {
    const menu = this.currentMenu;

    const currentIndex = menu.reduce((carry, value, index) => {
      return value === this.currentOption ? index : carry;
    }, 0);

    const previousIndex =
      currentIndex === 0 ? menu.length - 1 : currentIndex - 1;

    this.selected[this.selected.length - 1] = menu[previousIndex];
  }

  /** Traverse forward to the next menu option within the same level */
  protected next() {
    const menu = this.currentMenu;

    const currentIndex = menu.reduce((carry, value, index) => {
      return value === this.currentOption ? index : carry;
    }, 0);

    const nextIndex = currentIndex === menu.length - 1 ? 0 : currentIndex + 1;

    this.selected[this.selected.length - 1] = menu[nextIndex];
  }

  /**
   * Determine if current menu option has a sub-menu
   *
   * @return if current menu option has a sub-menu
   */
  protected hasSubMenu() {
    const current = this.currentOption;

    return current.menu?.length > 0;
  }
}

export default Menu;
