import { Vector } from "excalibur";
import { Drawable } from "@/interfaces";
import { Menu } from "./Menu";
import { SubMenu } from "./SubMenu";
import { bus, EventType } from "@/event/EventBus";
import { createConfig } from "./ui/MenuRenderConfigFactory";

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
  /** Name reference of the menu */
  protected _name = "startMenu";

  /**
   * @param _menu - menu options
   */
  constructor(protected _menu: SubMenu<StartMenuItem>) {
    super(_menu);
  }

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

    const config = createConfig(
      {
        font: {
          color: "#FFF",
          shadow_color: "#FFF",
          shadow_blur: 4,
          size: 42,
          align: "center",
        },
        menu: { background_color: "rgba(0, 0, 0, .85)" },
      },
      this
    );

    this._menu.draw(ctx, offset, resolution, config);
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
