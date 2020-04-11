import { bus } from "../app";
import { lcFirst } from "../util";
import Vector from "../Vector";
import { Drawable, Eventful, Lockable } from "../interfaces";

export default abstract class BaseMenu implements Eventful, Drawable, Lockable {
  protected menu: any;
  protected selected: any[];
  public locked: boolean;
  public active: Boolean;

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
  destroy() {
    if (this.active) {
      this.close();
    }

    bus.unregister(this);
  }

  select() {
    let option = this.currentOption;

    if (option.hasOwnProperty("menu") && option.menu.length) {
      this.selected.push(option.menu[0]);
    } else if (option.hasOwnProperty("action")) {
      option.action(this);
    }
  }

  back() {
    if (this.selected.length > 1) {
      return this.selected.pop();
    }

    this.close();
  }

  previous() {
    let menu = this.currentMenu;
    let option = this.currentOption;

    let index = menu.reduce((carry, value, index) => {
      return value === option ? index : carry;
    }, 0);

    if (index === 0) {
      this.selected[this.selected.length - 1] = menu[menu.length - 1];
    } else {
      this.selected[this.selected.length - 1] = menu[index - 1];
    }
  }

  next() {
    let menu = this.currentMenu;
    let option = this.currentOption;

    let index = menu.reduce((carry, value, index) => {
      return value === option ? index : carry;
    }, 0);

    if (index === menu.length - 1) {
      this.selected[this.selected.length - 1] = menu[0];
    } else {
      this.selected[this.selected.length - 1] = menu[index + 1];
    }
  }

  hasSubMenu(): boolean {
    let current = this.currentOption;

    return current.menu && current.menu.length;
  }

  /**
   * Draw game and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector) {}

  register(): object {
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

  get currentOption() {
    return this.selected[this.selected.length - 1];
  }

  get currentMenu() {
    return this.selected.length > 1
      ? this.selected[this.selected.length - 2].menu
      : this.menu;
  }
}
