import Vector from "@/physics/math/Vector";
import { Drawable } from "@/interfaces";
import { Menu } from "./Menu";
import { MenuItem } from "./MenuItem";
import { SubMenu } from "./SubMenu";
import { bus, EventType } from "@/event/EventBus";

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

    const config = {
      font: {
        color: "#EEE",
        shadow_color: "#FFF",
        highlight_color: "#0AA",
        size: 42,
        subtext_size: 16,
        family: "Minecraftia",
      },
      background_color: "#555",
      default_menu: this.menu,
      isMainMenu: (_menu: SubMenu<StartMenuItem>) => false,
      isCurrentOption: this._isCurrentOption.bind(this),
      isSelected: (item: MenuItem<StartMenuItem>) => this._isSelected(item),
      isSubMenuItem: (_item: MenuItem<StartMenuItem>) => false,
      getBadgeTitle: (_menu: MenuItem<StartMenuItem>) => "",
      shouldDrawDetails: () => false,
    };

    this._menu.draw(ctx, offset, resolution, config as any);
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
