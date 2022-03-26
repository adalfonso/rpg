import CombatStrategy from "@/combat/strategy/CombatStrategy";
import Vector from "@/physics/math/Vector";
import { Drawable } from "@/interfaces";
import { EventType } from "@/event/EventBus";
import { Menu } from "./Menu";
import { MenuItem } from "./MenuItem";

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
   * Draw BattleMenu and all underlying entities
   *
   * @param ctx         - render context
   * @param offset      - render position offset
   * @param _resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    _resolution: Vector
  ) {
    ctx.save();
    ctx.font = "12px Minecraftia";

    const tile_size = new Vector(72, 24);
    const tile_padding = new Vector(8, 0);

    const base_position = new Vector(
      offset.x - (tile_size.x + tile_padding.x) * this._menu.items.length,
      offset.y + tile_size.y
    ).plus(this._position);

    this._menu.items.forEach((option, index) => {
      const is_selected = option === this.selected[0];
      const position = new Vector(tile_size.x + tile_padding.x, 0)
        .times(index + 1)
        .plus(base_position);

      ctx.fillStyle = "#FFF";

      if (option === this.selected[0]) {
        ctx.fillStyle = "#DDD";
        ctx.strokeRect(position.x, position.y, tile_size.x, tile_size.y);
      }

      ctx.fillRect(position.x, position.y, tile_size.x, tile_size.y);
      ctx.fillStyle = "#333";

      ctx.save();

      this.applyHighlight(ctx, option);

      const textOffset = new Vector(4, 4 + 20);

      ctx.fillText(
        option.displayAs,
        position.x + textOffset.x,
        position.y + textOffset.y
      );

      ctx.restore();

      if (is_selected && option.menu) {
        option.menu.items.forEach((subOption, index) => {
          ctx.save();

          this.applyHighlight(ctx, subOption);

          const subOffset = new Vector(0, 18 * (index + 1) + 32);

          ctx.fillText(
            subOption.displayAs,
            position.x + subOffset.x,
            position.y + subOffset.y
          );
          ctx.restore();
        });
      }
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
      [EventType.Keyboard]: {
        keyup: (e: KeyboardEvent) => {
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
        },
      },
    };
  }

  /**
   * Apply text highlighting to the menu option when necessary
   *
   * @param ctx    - render context
   * @param option - menu option
   */
  private applyHighlight(
    ctx: CanvasRenderingContext2D,
    option: MenuItem<BattleMenuItem>
  ) {
    if (!this._isCurrentOption(option)) {
      return;
    }
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "#0DD";
  }
}
