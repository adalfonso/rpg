import AnimationFactory from "@/ui/animation/AnimationFactory";
import AnimationQueue from "@/ui/animation/AnimationQueue";
import BattleMenu from "@/menu/BattleMenu";
import Dialogue from "@/ui/Dialogue";
import Enemy from "@/actors/Enemy";
import Player from "@/actors/Player";
import TextStream from "@/ui/TextStream";
import Vector from "@common/Vector";
import { Drawable, Eventful, Lockable, CallableMap } from "@/interfaces";
import { bus } from "@/EventBus";

class Battle implements Eventful, Drawable, Lockable {
  /**
   * Animation sequence occurring in the battle
   *
   * @prop {AnimationQueue} _animation
   */
  private _animation: AnimationQueue;
  /**
   * Menu for the battle
   *
   * @prop {BattleMenu} _menu
   */
  private _menu: BattleMenu;

  /**
   * Dialogue in the battle
   *
   * @prop {Dialogue} _dialogue
   */
  private _dialogue: Dialogue = null;

  /**
   * Enemies being fought
   *
   * @prop {Enemy[]} _enemy
   */
  private _foes: Enemy[] = [];

  /**
   * Heroes in the battle
   *
   * @prop {Player[]} _heroes
   */
  private _heroes: Player[] = [];

  /**
   * If it is currently the player's turn
   *
   * @prop {boolean} _herosTurn
   */
  private _herosTurn: boolean = true;

  /**
   * If the battle is locked
   *
   * @prop {boolean} _locked
   */
  private _locked: boolean = false;

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

    this._heroes.push(player);

    this._heroes.forEach((hero) => {
      hero.savePosition();

      // TODO: make these scale
      hero.position = new Vector(64, 128);
      hero.direction = 4;
      hero.lock();
    });

    this._foes.push(enemy);

    this._foes.forEach((foe) => {
      foe.savePosition();
      foe.position = new Vector(256 + 64, 0);
      foe.direction = 2;
      foe.lock();
    });

    this._menu = this._getBattleMenu();

    this._animation = AnimationFactory.createStartBattleAnimation();

    bus.register(this);

    // Force enemy to attack if it is their turn first
    if (!this._herosTurn) {
      bus.emit("battle.action");
    }
  }

  /**
   * Determine if the battle is done
   *
   * @return {boolean} If the battle is done
   */
  get isDone() {
    const allHeroesDead =
      this._heroes.filter((hero) => hero.stats.hp > 0).length === 0;

    const allFoesDead =
      this._foes.filter((foe) => foe.stats.hp > 0).length === 0;

    return allHeroesDead || allFoesDead;
  }

  /**
   * Update the battle
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {
    if (this._animation) {
      this._animation.update(dt);

      if (this._animation.isDone) {
        this._animation = null;
      }
    }

    if (this._dialogue) {
      this._dialogue.update(dt);
    }

    if (this._dialogue?.done) {
      this._dialogue = null;

      // End battle after exp/lvl growth dialogue has ended
      if (this.isDone) {
        this._stop();
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
    let player: Player = this._heroes[0];

    ctx.fillStyle = "#CCC";
    ctx.fillRect(0, 0, width, height);

    this._heroes.forEach((hero) => hero.draw(ctx, offset, resolution));
    this._foes.forEach((foe) => foe.draw(ctx, offset, resolution));

    this._drawUiBar(ctx, resolution);
    this._drawEnemyUiBar(ctx, resolution);

    if (this._herosTurn) {
      let menuOffset = offset.plus(player.position).plus(player.size);

      this._menu.draw(ctx, menuOffset, resolution);
    }

    if (this._dialogue) {
      this._dialogue.draw(ctx, new Vector(0, 0), resolution);
    }

    if (this._animation) {
      this._animation.draw(ctx, new Vector(0, 0), resolution);
    }
  }

  /**
   * Register events with the event bus
   *
   * @return {CallableMap} Events to register
   */
  public register(): CallableMap {
    return {
      "battle.action": (e: CustomEvent) => {
        let player = this._heroes[0];
        let enemy = this._foes[0];

        if (this._herosTurn) {
          this._heroes.forEach((hero) =>
            hero.attack(enemy, e.detail.combatStrategy)
          );
        } else {
          this._foes.forEach((foe) => foe.attack(player));
        }

        const allHeroesDead =
          this._heroes.filter((hero) => hero.stats.hp > 0).length === 0;

        const allFoesDead =
          this._foes.filter((foe) => foe.stats.hp > 0).length === 0;

        if (allHeroesDead) {
          this._doGameOver();
        } else if (allFoesDead) {
          this._payExp();
        } else {
          this._cycle();
        }
      },
      "actor.gainExp": (e: CustomEvent) => {
        let name = this._heroes[0].displayAs;
        let exp = e.detail.exp;
        let levels = e.detail.levels;
        let moveSet = e.detail.moveSet;
        let dialogue = [`${name} gained ${exp} exp.`];

        levels.forEach((lvl: number) => {
          dialogue.push(`${name} grew to level ${lvl}!`);

          moveSet
            .filter((move: any) => move.level === lvl)
            .forEach((move: any) => {
              dialogue.push(`${name} learned ${move.displayAs}!`);
            });
        });

        let stream = new TextStream(dialogue);

        this._dialogue = new Dialogue(stream, undefined, [
          ...this._heroes,
          ...this._foes,
        ]);
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
    this._locked = true;
    return this._menu.lock();
  }

  /**
   * Unlock the battle and its menu
   *
   * @return {boolean} If the unlock was successful
   */
  public unlock(): boolean {
    this._locked = false;
    return this._menu.unlock();
  }

  /**
   * Pay experience out the heroes
   */
  private _payExp() {
    const accumExp = (n: number, foe: Enemy) => n + foe.stats.givesExp;

    const expGained = Math.ceil(
      this._foes.reduce(accumExp, 0) / this._heroes.length
    );

    this._heroes.forEach((hero) => hero.gainExp(expGained));
  }

  /**
   * Cause game over
   */
  private _doGameOver() {
    let stream = new TextStream(["You died!"]);

    this._dialogue = new Dialogue(stream, this._heroes[0], [
      ...this._heroes,
      ...this._foes,
    ]);

    this.lock();
  }

  /**
   * Run one cycle of the battle
   */
  private _cycle() {
    this._herosTurn = !this._herosTurn;

    if (!this._herosTurn) {
      bus.emit("battle.action");
    }
  }

  /**
   * End the battle
   */
  private _stop() {
    this.unlock();
    [...this._heroes, ...this._foes].forEach((actor) =>
      actor.restorePosition()
    );

    this._foes.forEach((foe) => foe.kill());

    bus.emit("battle.end");
    bus.unregister(this);

    this._menu.destroy();
    this.active = false;
  }

  /**
   * Draw the UI bar for the player
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   resolution Render resolution
   */
  private _drawUiBar(ctx: CanvasRenderingContext2D, resolution: Vector) {
    let uiBarSize = this._getUiBarSize(resolution);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, uiBarSize.x, uiBarSize.y);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText("HP : " + this._heroes[0].stats.hp, 16, 32);
  }

  /**
   * Draw the UI bar for the enemy
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   resolution Render resolution
   */
  private _drawEnemyUiBar(ctx: CanvasRenderingContext2D, resolution: Vector) {
    const uiBarSize = this._getUiBarSize(resolution);
    const position = new Vector(resolution.x - uiBarSize.x, 0);

    ctx.fillStyle = "#000";
    ctx.fillRect(position.x, position.y, uiBarSize.x, uiBarSize.y);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText(
      "HP : " + this._foes[0].stats.hp,
      position.x + 16,
      position.y + 32
    );
  }

  /**
   * Get the size of the UI bar based on screen resolution
   *
   * @param  {Vector} resolution Current screen resolution
   *
   * @return {Vector}            Size of the UI bar
   */
  private _getUiBarSize(resolution: Vector) {
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
  private _getBattleMenu(): BattleMenu {
    const player = this._heroes[0];

    return new BattleMenu([
      {
        type: "Items",
        menu: [],
      },
      {
        type: "Attack",
        menu: player.weapon ? [player.weapon] : [],
      },
      {
        type: "Spells",
        menu: player.spells,
      },
      {
        type: "Other",
        menu: ["Defend", "Run Away"],
      },
    ]);
  }
}

export default Battle;
