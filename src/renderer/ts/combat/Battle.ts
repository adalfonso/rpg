import Actor from "@/actors/Actor";
import AnimationFactory from "@/ui/animation/AnimationFactory";
import AnimationQueue from "@/ui/animation/AnimationQueue";
import BattleMenu from "@/menu/BattleMenu";
import Dialogue from "@/ui/Dialogue";
import HeroTeam from "./HeroTeam";
import Team from "./Team";
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
   * @param {HeroTeam} _heroes Heroes in battle
   * @param {Team}     _foes   Enemies in battle
   */
  constructor(private _heroes: HeroTeam, private _foes: Team) {
    this.active = true;

    this._heroes.each((hero: Actor) => {
      hero.savePosition();

      // TODO: make these scale
      hero.position = new Vector(64, 128);
      hero.direction = 4;
      hero.lock();
    });

    this._foes.each((foe: Actor) => {
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
    return this._heroes.areDefeated || this._foes.areDefeated;
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
    const width: number = resolution.x;
    const height: number = resolution.y;
    const player = this._heroes.leader;

    ctx.fillStyle = "#CCC";
    ctx.fillRect(0, 0, width, height);

    this._heroes.each((hero: Actor) => hero.draw(ctx, offset, resolution));
    this._foes.each((foe: Actor) => foe.draw(ctx, offset, resolution));

    this._drawUiBar(ctx, resolution);
    this._drawEnemyUiBar(ctx, resolution);

    if (this._herosTurn) {
      const menuOffset = offset.plus(player.position).plus(player.size);

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
        let player = this._heroes.leader;
        let enemy = this._foes.leader;

        if (this._herosTurn) {
          this._heroes.each((hero: Actor) =>
            hero.attack(enemy, e.detail.combatStrategy)
          );
        } else {
          this._foes.each((foe: Actor) => foe.attack(player));
        }

        if (this._heroes.areDefeated) {
          this._doGameOver();
        } else if (this._foes.areDefeated) {
          this._heroes.gainExp(this._foes.givesExp);
        } else {
          this._cycle();
        }
      },
      "actor.gainExp": (e: CustomEvent) => {
        let name = this._heroes.leader.displayAs;
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
          ...this._heroes.all(),
          ...this._foes.all(),
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
   * Cause game over
   */
  private _doGameOver() {
    let stream = new TextStream(["You died!"]);

    this._dialogue = new Dialogue(stream, this._heroes.leader, [
      ...this._heroes.all(),
      ...this._foes.all(),
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

    this._heroes.each((hero: Actor) => hero.restorePosition());

    this._foes.each((foe: Actor) => {
      foe.restorePosition();
      foe.kill();
    });

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
    ctx.fillText("HP : " + this._heroes.leader.stats.hp, 16, 32);
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
      "HP : " + this._foes.leader.stats.hp,
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
    const player = this._heroes.leader;

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
