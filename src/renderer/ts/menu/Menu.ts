import UnimplementedMethodError from "@/error/UnimplementMethodError";
import Vector from "@common/Vector";
import { Drawable, Eventful, Lockable, CallableMap } from "@/interfaces";
import { bus } from "@/EventBus";
import { lcFirst } from "@/util";

/**
 * A visual UI that can be opened, closed, and traversed
 */
abstract class Menu implements Eventful, Drawable, Lockable {
  /**
   * A stack of the currently selected menu options
   *
   * If the menu contains sub-menus, the stack will grow to store the menu path.
   */
  protected selected: any[];

  /**
   * If the menu is locked
   */
  protected locked: boolean = false;

  /**
   * If the menu is currently active
   */
  public active: Boolean;

  /**
   * Create a Menu-based instance
   *
   * @param menu - menu options
   */
  constructor(protected menu: any[]) {
    this.selected = [];
    this.selected.push(this.menu[0]);

    bus.register(this);
  }

  /**
   * Get the current selected menu option
   */
  get currentOption(): any {
    return this.selected[this.selected.length - 1];
  }

  /**
   * Get the current list of menu options being displayed.
   */
  get currentMenu(): any {
    return this.selected.length > 1
      ? this.selected[this.selected.length - 2].menu
      : this.menu;
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
    this.selected = [this.menu[0]];
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

    if (option.menu?.length) {
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

    let currentIndex = menu.reduce(
      (carry: number, value: any, index: number) => {
        return value === this.currentOption ? index : carry;
      },
      0
    );

    let previousIndex = currentIndex === 0 ? menu.length - 1 : currentIndex - 1;

    this.selected[this.selected.length - 1] = menu[previousIndex];
  }

  /**
   * Traverse forward to the next menu option within the same level
   */
  protected next() {
    let menu = this.currentMenu;

    let currentIndex = menu.reduce(
      (carry: number, value: any, index: number) => {
        return value === this.currentOption ? index : carry;
      },
      0
    );

    let nextIndex = currentIndex === menu.length - 1 ? 0 : currentIndex + 1;

    this.selected[this.selected.length - 1] = menu[nextIndex];
  }

  /**
   * Determine if current menu option has a sub-menu
   *
   * @return if current menu option has a sub-menu
   */
  protected hasSubMenu(): boolean {
    let current = this.currentOption;

    return current.menu?.length;
  }
}

export default Menu;
