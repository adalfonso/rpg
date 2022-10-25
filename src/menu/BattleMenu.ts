import * as ex from "excalibur";
import CombatStrategy from "@/combat/strategy/CombatStrategy";
import { Drawable } from "@/interfaces";
import { EventType } from "@/event/EventBus";
import { Menu } from "./Menu";
import { Vector } from "excalibur";
import { createConfig } from "./ui/MenuRenderConfigFactory";

export interface BattleMenuItem {
  /**
   * Battle menu items typically have a use method (CombatStrategy, Ability,
   * etc.), but not always because a sub-menu may also be used to represent a
   * menu item.
   */
  use?: () => void;
}

/** In-battle menu of a player's items, attack, and abilities */
export class BattleMenu extends Menu<BattleMenuItem> implements Drawable {
  /** Name reference of the menu */
  protected _name = "battleMenu";

  /** If the currently selection option is combat-oriented */
  get wantsCombat() {
    return this.currentOption.source instanceof CombatStrategy;
  }

  /**
   * Draw and all underlying entities
   *
   * @param ctx - render context
   * @param resolution - render resolution
   */
  public draw(ctx: ex.ExcaliburGraphicsContext, resolution: ex.Vector) {
    this._canvas.draw(
      ctx,
      resolution,
      (ctx: CanvasRenderingContext2D, resolution: ex.Vector) => {
        const config = createConfig(
          {
            font: {
              size: 12,
              color: "#333",
              background_color: "#FFF",
              border_color: "#DDD",
              shadow_offset: new Vector(1, 1),
              highlight_color: "#0DD",
            },
            logic: { isSelected: this._isSelected.bind(this) },
          },
          this
        );

        const offset = ex.Vector.Zero;

        this._menu.draw(ctx, offset.add(this.position), resolution, config);
      }
    );
  }

  /** Reset this menu back to its original option */
  public reset() {
    this.selected = [this._menu.items[0]];
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Keyboard]: {
        keyup: this._handleKeypress.bind(this),
      },
    };
  }

  /**
   * React to a key press
   *
   * @param e - keyboard event
   */
  private _handleKeypress(e: KeyboardEvent) {
    if (this.locked) {
      return;
    }

    const menu = this.currentMenu;
    const option = this.currentOption;

    switch (e.key) {
      case "ArrowDown":
        if (this._hasSubMenu()) {
          this.select();
        } else if (this.selected.length > 1) {
          this.next();
        }
        break;

      case "ArrowUp": {
        const [first_item] = menu.items;
        const is_first_option =
          option === first_item || option.source === first_item?.source;

        if (is_first_option) {
          this.back();
        } else if (this.selected.length > 1) {
          this.previous();
        }
        break;
      }

      case "ArrowLeft":
        if (this.selected.length === 1) {
          this.previous();
        }
        break;

      case "ArrowRight":
        if (this.selected.length === 1) {
          this.next();
        }
        break;

      case "Enter": {
        const use = option.get("use");

        use instanceof Function && use.bind(option.source)();

        break;
      }
    }
  }
}
