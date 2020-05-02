import BattleMenu from "./menu/BattleMenu";
import Dialogue from "./ui/Dialogue";
import Enemy from "./actors/Enemy";
import Player from "./actors/Player";
import TextStream from "./ui/TextStream";
import Vector from "@common/Vector";
import { Drawable, Eventful, Lockable } from "./interfaces";
import { bus } from "@/EventBus";

class Battle implements Eventful, Drawable, Lockable {
  /**
   * Menu for the battle
   *
   * @prop {BattleMenu} menu
   */
  private menu: BattleMenu;

  /**
   * Dialogue in the battle
   *
   * @prop {Dialogue} dialogue
   */
  private dialogue: Dialogue = null;

  /**
   * Enemy being fought
   *
   * @prop {Enemy} enemy
   */
  private enemy: Enemy;

  /**
   * Player instance
   *
   * @prop {Player} player
   */
  private player: Player;

  /**
   * If it is currently the player's turn
   *
   * @prop {boolean} playersTurn
   */
  private playersTurn: boolean;

  /**
   * If the battle is locked
   *
   * @prop {boolean} locked
   */
  private locked: boolean = false;

  /**
   * If the battle is currently active
   *
   * @prop {boolean} active
   */
  public active: boolean;

  /**
   * Create a new battle instance
   *
   * @param {Player} player Player in battle
   * @param {Enemy}  enemy  Enemy in battle
   */
  constructor(player: Player, enemy: Enemy) {
    this.active = true;

    this.player = player;
    this.player.savePosition();

    // TODO: make these scale
    this.player.position = new Vector(64, 128);
    this.player.direction = 4;
    this.player.lock();

    this.enemy = enemy;
    this.enemy.savePosition();
    this.enemy.position = new Vector(256 + 64, 0);
    this.enemy.direction = 2;
    this.enemy.lock();

    this.playersTurn = this.player.stats.spd > this.enemy.stats.spd;
    this.menu = this.getBattleMenu();

    bus.register(this);
  }

  /**
   * Update the battle
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {
    if (this.dialogue) {
      this.dialogue.update(dt);
    }

    if (this.dialogue?.done) {
      this.dialogue = null;

      // End battle after exp/lvl growth dialogue has ended
      if (this.isDone()) {
        this.stop();
      }
    }
  }

  /**
   * Draw Battle and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    let width: number = resolution.x;
    let height: number = resolution.y;

    ctx.save();
    ctx.fillStyle = "#CCC";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.restore();

    ctx.save();

    ctx.translate(offset.x, offset.y);

    this.player.draw(ctx, offset, resolution);
    this.enemy.draw(ctx, offset, resolution);

    ctx.restore();

    this.drawUiBar(ctx, resolution);
    this.drawEnemyUiBar(ctx, resolution);

    if (this.playersTurn) {
      let playerOffset = offset
        .plus(this.player.position)
        .plus(this.player.size);

      this.menu.draw(ctx, playerOffset, resolution);
    }

    if (this.dialogue) {
      this.dialogue.draw(ctx, undefined, resolution);
    }
  }

  /**
   * Register events with the event bus
   *
   * @return {object} Events to register
   */
  public register(): object {
    return {
      battleAction: (e) => {
        if (this.playersTurn) {
          this.player.attack(this.enemy, e.attack);
        } else {
          this.enemy.attack(this.player);
        }

        if (this.player.stats.hp <= 0) {
          // TODO: Handle player's death
        } else if (this.enemy.stats.hp <= 0) {
          this.player.gainExp(this.enemy.stats.givesExp);
        } else {
          this.cycle();
        }
      },
      "stats.gainExp": (e) => {
        let name = this.player.dialogueName;
        let exp = e.detail.exp;
        let lvl = e.detail.lvl;
        let dialogue = [`${name} gained ${exp} exp.`];

        if (lvl) {
          dialogue.push(`${name} grew to level ${lvl}!`);
        }

        let stream = new TextStream(dialogue);

        this.dialogue = new Dialogue(stream, this.player, [this.enemy]);
        this.lock();
      },
    };
  }

  /**
   * Lock the battle and its menu
   *
   * @return {boolean} If the lock was successful
   */
  public lock(): boolean {
    this.locked = true;
    return this.menu.lock();
  }

  /**
   * Unlock the battle and its menu
   *
   * @return {boolean} If the unlock was successful
   */
  public unlock(): boolean {
    this.locked = false;
    return this.menu.unlock();
  }

  /**
   * Determine if the battle is done
   *
   * @return {boolean} If the battle is done
   */
  private isDone() {
    return this.player.stats.hp <= 0 || this.enemy.stats.hp <= 0;
  }

  /**
   * Run one cycle of the battle
   */
  private cycle() {
    this.playersTurn = !this.playersTurn;

    if (!this.playersTurn) {
      bus.emit("battleAction", this);
    }
  }

  /**
   * End the battle
   */
  private stop() {
    this.unlock();
    this.player.restorePosition();
    this.enemy.restorePosition();
    this.enemy.kill();

    bus.emit("battle.end");
    bus.unregister(this);

    this.menu.destroy();
    this.active = false;
  }

  /**
   * Draw the UI bar for the player
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   resolution Render resolution
   */
  private drawUiBar(ctx: CanvasRenderingContext2D, resolution: Vector) {
    let uiBarSize = this.getUiBarSize(resolution);

    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, uiBarSize.x, uiBarSize.y);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText("HP : " + this.player.stats.hp, 16, 32);
    ctx.restore();
  }

  /**
   * Draw the UI bar for the enemy
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   resolution Render resolution
   */
  private drawEnemyUiBar(ctx: CanvasRenderingContext2D, resolution: Vector) {
    let uiBarSize = this.getUiBarSize(resolution);
    ctx.save();
    ctx.translate(resolution.x - uiBarSize.x, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, uiBarSize.x, uiBarSize.y);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText("HP : " + this.enemy.stats.hp, 16, 32);
    ctx.restore();
  }

  /**
   * Get the size of the UI bar based on screen resolution
   *
   * @param  {Vector} resolution Current screen resolution
   *
   * @return {Vector}            Size of the UI bar
   */
  private getUiBarSize(resolution: Vector) {
    return new Vector(
      Math.round(resolution.x * 0.4),
      Math.round(resolution.y * 0.07)
    );
  }

  /**
   * Create a new battle menu
   *
   * TODO: consider moving this to a factory
   *
   * @return {BattleMenu} The battle menu
   */
  private getBattleMenu(): BattleMenu {
    return new BattleMenu([
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
      },
    ]);
  }
}

export default Battle;
