import Vector from "@/Vector";
import { Drawable, Eventful, Lockable } from "@/interfaces";
import { bus } from "@/app";
import { lcFirst } from "@/util";

/**
 * Menu is a visual UI that can be opened, closed, and traversed
 */
abstract class Menu implements Eventful, Drawable, Lockable {
  /**
   * The actual menu choices. The content of which is really up to the sub-class
   * to determine as this base class has no context.
   *
   * @prop {any[]} menu
   */
  protected menu: any[];

  /**
   * A stack of the currently selected menu options. If the menu contains sub-
   * menus, the stack will grow to store the menu path.
   *
   * @prop {any[]} selected
   */
  protected selected: any[];

  /**
   * If the menu is locked
   *
   * @prop {boolean} locked
   */
  public locked: boolean;

  /**
   * If the menu is currently active
   *
   * @prop {boolean} active
   */
  public active: Boolean;

  /**
   * Create a Menu-based instance
   *
   * @param {any[]} menu Menu options
   */
  constructor(menu) {
    this.menu = menu;
    this.selected = [];
    this.selected.push(this.menu[0]);

    bus.register(this);
  }

  /**
   * Open the menu
   */
  public open() {
    this.active = true;
    bus.emit(`menu.${lcFirst(this.constructor.name)}.open`);
  }

  /**
   * Close the menu
   */
  public close() {
    this.active = false;
    bus.emit(`menu.${lcFirst(this.constructor.name)}.close`);
  }

  /**
   * Lock the menu
   *
   * @return {boolean} If unlock was successful
   */
  public lock(): boolean {
    this.locked = true;

    return true;
  }

  /**
   * Unlock the menu
   *
   * @return {boolean} If unlock was successful
   */
  public unlock(): boolean {
    this.locked = false;

    return true;
  }

  /**
   * Completely remove the menu
   */
  public destroy() {
    if (this.active) {
      this.close();
    }

    bus.unregister(this);
  }

  /**
   * Choose the currently selected menu option and run any associated action
   */
  protected select() {
    let option = this.currentOption;

    if (option.hasOwnProperty("menu") && option.menu.length) {
      this.selected.push(option.menu[0]);
    } else if (option.hasOwnProperty("action")) {
      option.action(this);
    }
  }

  /**
   * Traverse back one sub menu in the menu tree or close the menu
   */
  protected back() {
    if (this.selected.length > 1) {
      this.selected.pop();
      return;
    }

    this.close();
  }

  /**
   * Traverse back to the previous menu option within the same level
   */
  protected previous() {
    let menu = this.currentMenu;

    let currentIndex = menu.reduce((carry, value, index) => {
      return value === this.currentOption ? index : carry;
    }, 0);

    let previousIndex = currentIndex === 0 ? menu.length - 1 : currentIndex - 1;

    this.selected[this.selected.length - 1] = menu[previousIndex];
  }

  /**
   * Traverse forward to the next menu option within the same level
   */
  protected next() {
    let menu = this.currentMenu;

    let currentIndex = menu.reduce((carry, value, index) => {
      return value === this.currentOption ? index : carry;
    }, 0);

    let nextIndex = currentIndex === menu.length - 1 ? 0 : currentIndex + 1;

    this.selected[this.selected.length - 1] = menu[nextIndex];
  }

  /**
   * Determine if current menu option has a sub-menu
   *
   * @return {boolean} If current menu option has a sub-menu
   */
  protected hasSubMenu(): boolean {
    let current = this.currentOption;

    return current.menu?.length;
  }

  /**
   * Draw Menu and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {}

  /**
   * Register events with the event bus.
   *
   * TODO: This menu is vertical orientation, with sub-classes left to override
   * how key codes are interpreted. This is bad design. Perhaps there should be
   * further extractions for more generic sub-classes. Additionaly menus with
   * sub-menus may benefit from parsing the sub-menus as actual menu instances
   * instead of using an object literal.
   *
   * @return {object} Events to register
   */
  public register(): object {
    return {
      keyup: (e) => {
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

  /**
   * Get the current selected menu option
   *
   * @prop {mixed} currentOption Currently selected menu option
   */
  get currentOption() {
    return this.selected[this.selected.length - 1];
  }

  /**
   * Get the current list of menu options being displayed.
   *
   * @prop {any[]} currentMenu Currently selected menu
   */
  get currentMenu() {
    return this.selected.length > 1
      ? this.selected[this.selected.length - 2].menu
      : this.menu;
  }
}

export default Menu;
