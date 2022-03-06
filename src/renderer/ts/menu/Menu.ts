import UnimplementedMethodError from "@/error/UnimplementMethodError";
import Vector from "@common/Vector";
import { Drawable, Lockable } from "@/interfaces";
import { Empty } from "@/mixins";
import { MenuItem } from "./MenuItem";
import { Movable } from "@/Entity";
import { SubMenu } from "./SubMenu";
import { bus, EventType } from "@/EventBus";
import { lcFirst } from "@/util";

/** A visual UI that can be opened, closed, and traversed */
export abstract class Menu<T>
  extends Movable(Empty)
  implements Drawable, Lockable
{
  /**
   * A stack of the currently selected menu options
   *
   * If the menu contains sub-menus, the stack will grow to store the menu path.
   */
  protected selected: MenuItem<T>[];

  /** If the menu is locked */
  protected locked = false;

  /** If the menu is currently active */
  public active = false;

  /**
   * Create a Menu-based instance
   *
   * @param _menu - menu options
   * @param _position - menu position
   */
  constructor(
    protected _menu: SubMenu<T>,
    protected _position = Vector.empty()
  ) {
    super();
    this.selected = [this._menu.items[0]];

    bus.register(this);
  }

  /** Get the current selected menu option */
  get currentOption() {
    return this.selected[this.selected.length - 1];
  }

  /** Get the current list of menu options being displayed. */
  get currentMenu() {
    if (this.selected.length <= 1) {
      return this._menu;
    }

    const { menu } = this.selected[this.selected.length - 2];

    if (menu === undefined) {
      throw new Error("Cannot find current menu. This should never happen.");
    }

    return menu;
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
  public register() {
    return {
      [EventType.Keyboard]: {
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
    this.selected = [this._menu.items[0]];
    this.active = false;
    bus.emit(`menu.${lcFirst(this.constructor.name)}.close`);
  }

  /**
   * Lock the menu
   *
   * @return if unlock was successful
   */
  public lock() {
    this.locked = true;

    return true;
  }

  /**
   * Unlock the menu
   *
   * @return if unlock was successful
   */
  public unlock() {
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
    const option = this.currentOption;

    const { menu } = option;

    if (!menu?.items?.length) {
      return;
    }

    const [first_item] = menu.items;

    this.selected = [...this.selected, first_item];
  }

  /** Traverse back one sub menu in the menu tree or close the menu */
  protected back() {
    if (this.selected.length > 1) {
      this.selected = this.selected.slice(0, -1);

      return;
    }

    this.close();
  }

  /** Traverse back to the previous menu option within the same level */
  protected previous() {
    const menu = this.currentMenu;

    const current_index = menu.items.reduce((carry, value, index) => {
      return value === this.currentOption ? index : carry;
    }, 0);

    const previous_index =
      current_index === 0 ? menu.items.length - 1 : current_index - 1;

    this.selected[this.selected.length - 1] = menu.items[previous_index];
  }

  /** Traverse forward to the next menu option within the same level */
  protected next() {
    const menu = this.currentMenu;

    const current_index = menu.items.reduce((carry, value, index) => {
      return value === this.currentOption ? index : carry;
    }, 0);

    const next_index =
      current_index === menu.items.length - 1 ? 0 : current_index + 1;

    this.selected[this.selected.length - 1] = menu.items[next_index];
  }

  /**
   * Determine if input contains a menu
   *
   * @param input - input to test
   * @returns if input has a menu
   */
  protected _hasMenu = (input: unknown): input is { menu: unknown } =>
    typeof input === "object" &&
    input !== null &&
    "menu" in input &&
    input["menu"];

  /**
   * Determine if current menu option has a sub-menu
   *
   * @return if current menu option has a sub-menu
   */
  protected _hasSubMenu() {
    return (this.currentOption.menu?.items ?? []).length > 0;
  }
}
