import Vector from "@common/Vector";
import { Drawable } from "@/interfaces";
import { Menu } from "./Menu";
import { bus, EventType } from "@/EventBus";

export interface StartMenuItem {
  action: (menu: StartMenu) => void;
}

/**
 * The first menu to load when the game starts up
 *
 * It is responsible for higher level game functions like saving, changing
 * settings, and loading levels.
 */
export class StartMenu extends Menu<StartMenuItem> implements Drawable {
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

    this._menu.items.forEach((item, index) => {
      const selected = this._isCurrentOption(item);

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
        selected ? "▶ " + item.displayAs : item.displayAs,
        resolution.x / 2,
        (resolution.y / (this._menu.items.length - index)) * 0.5
      );
    });

    ctx.restore();
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Custom]: {
        "state.saved": (_e: CustomEvent) => {
          this.close();
        },
      },
      [EventType.Keyboard]: {
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
      },
    };
  }

  /** Run action for the menu item */
  protected select() {
    const option = this.currentOption;

    option.get("action")(this);
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
