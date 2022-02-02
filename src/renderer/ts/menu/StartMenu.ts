import Menu from "./Menu";
import Vector from "@common/Vector";
import { BaseMenuItem } from "./menus";
import { Drawable, CallableMap } from "@/interfaces";
import { bus } from "@/EventBus";

export interface StartMenuItem extends BaseMenuItem<StartMenuItem> {
  action: (menu: StartMenu) => void;
}

/**
 * The first menu to load when the game starts up
 *
 * It is responsible for higher level game functions like saving, changing
 * settings, and loading levels.
 */
class StartMenu extends Menu<StartMenuItem> implements Drawable {
  /**
   * Draw StartMenu and all underlying entities
   *
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    if (!this.active) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, .85)";
    ctx.fillRect(offset.x, offset.y, resolution.x, resolution.y);
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";

    this._menu.forEach((_option, index) => {
      const current = this._menu[index];
      const selected = current === this.currentOption;

      if (selected) {
        ctx.shadowColor = "#FFF";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;
        ctx.font = "bold 42px Arial";
      } else {
        ctx.font = "42px Arial";
      }

      ctx.fillText(
        selected ? "▶ " + current.displayAs : current.displayAs,
        resolution.x / 2,
        (resolution.y / (this._menu.length - index)) * 0.5
      );
    });

    ctx.restore();
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
    return {
      keyup: (e: KeyboardEvent) => {
        if (this.locked) {
          return;
        }

        if (e.key === "Escape") {
          this.active ? this.close() : this.open();
        }

        if (!this.active) {
          return;
        }

        switch (e.key) {
          case "Enter":
            this.select();
            break;
          case "ArrowUp":
            this.previous();
            break;
          case "ArrowDown":
            this.next();
            break;
        }
      },
      "state.saved": (_e: CustomEvent) => {
        this.close();
      },
    };
  }

  /** Run action for the menu item */
  protected select() {
    const option = this.currentOption;

    if ("action" in option) {
      option.action(this);
    }
  }

  /**
   * Trigger the game state to save.
   *
   * @emits state.save
   */
  public saveState() {
    bus.emit("state.save");
  }
}

export default StartMenu;
