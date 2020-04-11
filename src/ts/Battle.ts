import BattleMenu from "./menu/BattleMenu";
import Enemy from "./actors/Enemy";
import Player from "./actors/Player";
import Vector from "./Vector";
import { Drawable, Eventful } from "./interfaces";
import { bus } from "./app";

export default class Battle implements Eventful, Drawable {
  protected battleMenu: BattleMenu;
  protected enemy: Enemy;
  protected player: Player;
  protected playersTurn: boolean;
  public active: boolean;

  constructor(player, enemy) {
    this.active = true;

    this.player = player;
    this.player.savePos();
    this.player.pos.x = 64;
    this.player.pos.y = 128;
    this.player.direction = 4;
    this.player.lock();

    this.enemy = enemy;
    this.enemy.savePos();
    this.enemy.pos.x = 256 + 64;
    this.enemy.pos.y = 0;
    this.enemy.direction = 2;
    this.enemy.lock();

    this.playersTurn = this.player.stats.spd > this.enemy.stats.spd;
    this.battleMenu = this.getBattleMenu();

    bus.register(this);
  }

  cycle() {
    this.playersTurn = !this.playersTurn;

    if (!this.playersTurn) {
      bus.emit("battleAction", this);
    }
  }

  getBattleMenu(): BattleMenu {
    return new BattleMenu(
      {
        type: "Items",
        menu: [],
      },
      {
        type: "Attack",
        menu: this.player.weapon ? [this.player.weapon] : [],
      },
      {
        type: "Spells",
        menu: this.player.spells,
      },
      {
        type: "Other",
        menu: ["Defend", "Run Away"],
      }
    );
  }

  update(dt: number) {}

  /**
   * Draw game and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector) {
    let width: number = resolution.x;
    let height: number = resolution.y;

    ctx.save();
    ctx.fillStyle = "#ccc";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.restore();

    ctx.save();

    ctx.translate(offset.x, offset.y);

    this.player.draw(ctx, offset, resolution);
    this.enemy.draw(ctx, offset, resolution);

    ctx.restore();

    this.drawUiBar(ctx);
    this.drawEnemyUiBar(ctx, width, height);

    if (this.playersTurn) {
      let playerOffset = offset.plus(
        this.player.pos.x,
        this.player.pos.y + this.player.size.y
      );

      this.battleMenu.draw(ctx, playerOffset, resolution);
    }
  }

  drawUiBar(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 512, 48);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText("HP : " + this.player.stats.hp, 16, 32);
    ctx.restore();
  }

  drawEnemyUiBar(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.translate(width - 512, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 512, 48);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText("HP : " + this.enemy.stats.hp, 16, 32);
    ctx.restore();
  }

  register(): object {
    return {
      battleAction: (e) => {
        if (this.playersTurn) {
          this.player.attack(this.enemy, e.attack);
        } else {
          this.enemy.attack(this.player);
        }

        if (this.player.stats.hp <= 0) {
          // Handle death
        } else if (this.enemy.stats.hp <= 0) {
          this.player.stats.gainExp(this.enemy.stats.givesExp);

          this.player.restorePos();
          this.enemy.restorePos();

          this.stop();
        } else {
          this.cycle();
        }
      },
    };
  }

  stop() {
    this.enemy.defeated = true;
    this.active = false;
    bus.emit("battle.end");
    bus.unregister(this);
    this.battleMenu.destroy();
  }
}
