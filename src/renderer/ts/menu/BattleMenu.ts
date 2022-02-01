import CombatStrategy from "@/combat/strategy/CombatStrategy";
import Menu from "./Menu";
import Vector from "@common/Vector";
import { Drawable, Eventful, CallableMap } from "@/interfaces";

/**
 * Anatomy of a BattleMenu option
 */
type BattleMenuOption = {
  type: string;
  menu: any[];
};

/**
 * In-battle menu of a player's items, attack, and abilities
 */
class BattleMenu extends Menu implements Eventful, Drawable {
  /**
   * If the currently selection option is combat-oriented
   */
  get wantsCombat() {
    return this.currentOption instanceof CombatStrategy;
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

    const tileSize = new Vector(72, 24);
    const tilePadding = new Vector(8, 0);

    const basePosition = new Vector(
      offset.x - (tileSize.x + tilePadding.x) * this._menu.length,
      offset.y + tileSize.y
    ).plus(this._position);

    this._menu.forEach((option, index) => {
      const isSelected = option === this.selected[0];
      const position = new Vector(tileSize.x + tilePadding.x, 0)
        .times(index + 1)
        .plus(basePosition);

      ctx.fillStyle = "#FFF";

      if (option === this.selected[0]) {
        ctx.fillStyle = "#DDD";
        ctx.strokeRect(position.x, position.y, tileSize.x, tileSize.y);
      }

      ctx.fillRect(position.x, position.y, tileSize.x, tileSize.y);
      ctx.fillStyle = "#333";

      ctx.save();

      this.applyHighlight(ctx, option);

      const textOffset = new Vector(4, 4 + 20);

      ctx.fillText(
        option.type,
        position.x + textOffset.x,
        position.y + textOffset.y
      );

      ctx.restore();

      if (isSelected && option.menu?.length) {
        option.menu.forEach((subOption: any, index: number) => {
          ctx.save();

          this.applyHighlight(ctx, subOption);

          const displayAs = subOption.displayAs ?? subOption;
          const subOffset = new Vector(0, 18 * (index + 1) + 32);

          ctx.fillText(
            displayAs,
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
  public register(): CallableMap {
    return {
      keyup: (e: KeyboardEvent) => {
        if (this.locked) {
          return;
        }

        let menu = this.currentMenu;
        let option = this.currentOption;

        switch (e.key) {
          case "ArrowDown":
            if (this.hasSubMenu()) {
              this.select();
            } else if (this.selected.length > 1) {
              this.next();
            }
            break;

          case "ArrowUp":
            if (option === menu[0]) {
              this.back();
            } else if (this.selected.length > 1) {
              this.previous();
            }
            break;

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

          case "Enter":
            if (typeof option.use === "function") {
              option.use();
            }
            break;
        }
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
    option: BattleMenuOption
  ) {
    if (option === this.currentOption) {
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 0;
      ctx.shadowColor = "#0DD";
    }
  }
}

export default BattleMenu;
