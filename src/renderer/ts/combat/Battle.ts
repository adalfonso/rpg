import AbilityFactory from "./strategy/AbilityFactory";
import Actor, { Direction } from "@/actor/Actor";
import BattleMenu from "@/menu/BattleMenu";
import CombatStrategy from "./strategy/CombatStrategy";
import Dialogue from "@/ui/Dialogue";
import HeroTeam from "./HeroTeam";
import OpponentSelect from "./OpponentSelect";
import StatModifier from "./strategy/StatModifier";
import Team from "./Team";
import TextStream from "@/ui/TextStream";
import Vector from "@common/Vector";
import WeaponFactory from "./strategy/WeaponFactory";
import { AnimatedEntity } from "@/ui/animation/text/AnimatedEntity";
import { AnimatedText } from "@/ui/animation/text/AnimatedText";
import { Drawable, Eventful, Lockable, CallableMap } from "@/interfaces";
import { LearnedAbility } from "./strategy/types";
import { bus } from "@/EventBus";
import { createAnimation } from "@/ui/animation/CreateAnimation";
import menus from "@/menu/menus";

interface BattleEvent {
  isDone: boolean;
  update(dt: number): void;
  draw?(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ): void;
}

const isBattleEvent = (event: unknown): event is BattleEvent =>
  typeof event === "object" &&
  typeof event["isDone"] === "boolean" &&
  event["update"] instanceof Function;

class Battle implements Eventful, Drawable, Lockable {
  /** Menu for the battle */
  private _menu: BattleMenu;

  /** If it is currently the player's turn */
  private _herosTurn = true;

  /** Queue of animations and battle actions to execute */
  private _event_queue: (BattleEvent | (() => void))[] = [];

  /** If the battle is currently active */
  public active: boolean;

  /**
   * Create a new battle instance
   *
   * @param _heroes         - heroes in battle
   * @param _foes           - enemies in battle
   * @param _opponentSelect - utility to traverse opponents in battle
   * @param start_animation - animation sequence occurring at the start of battle
   *
   * @emits battle.action
   */
  constructor(
    private _heroes: HeroTeam,
    private _foes: Team,
    private _opponentSelect: OpponentSelect,
    start_animation: AnimatedText
  ) {
    this.active = true;
    this._event_queue.push(
      () => this.lock(),
      start_animation,
      () => this.unlock()
    );

    // TODO: make these scale
    this._heroes.prepare(Direction.East, new Vector(64, 128));
    this._foes.prepare(Direction.West, new Vector(256 + 64, 0));

    this._menu = this._getBattleMenu();

    // TODO: this needs to be rerun whenever the attacking team member changes
    //       when there are more than one member on the team this will be a
    //       problem
    this._menu.moveTo(
      this._heroes.leader.position.plus(this._heroes.leader.size)
    );

    bus.register(this);

    // Force enemy to attack if it is their turn first
    if (!this._herosTurn) {
      bus.emit("battle.action");
    }
  }

  /** Determine if the battle is done */
  get isDone() {
    return this._heroes.areDefeated || this._foes.areDefeated;
  }

  /**
   * Update the battle
   *
   * @param dt - delta time
   */
  public update(dt: number) {
    if (this._event_queue.length > 0) {
      const [event] = this._event_queue;

      if (isBattleEvent(event)) {
        event.update(dt);

        // TODO: will this cause the final frame of the animation to not render?
        if (event.isDone) {
          this._event_queue.shift();
        }
      } else {
        event();
        this._event_queue.shift();
      }
    }

    this._menu.wantsCombat
      ? this._opponentSelect.unlock()
      : this._opponentSelect.lock();

    if (this.isDone && this._event_queue.length === 0) {
      this.stop();
    }
  }

  /**
   * Draw Battle and all underlying entities
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
    const width: number = resolution.x;
    const height: number = resolution.y;
    ctx.fillStyle = "#CCC";
    ctx.fillRect(0, 0, width, height);

    this._heroes.draw(ctx, offset, resolution);
    this._foes.draw(ctx, offset, resolution);

    this._drawUiBar(ctx, resolution);
    this._drawEnemyUiBar(ctx, resolution);

    if (this._herosTurn) {
      this._menu.draw(ctx, offset, resolution);

      if (!this._opponentSelect.isLocked) {
        this._opponentSelect.draw(ctx, offset, resolution);
      }
    }

    const [event] = this._event_queue;

    if (isBattleEvent(event) && event?.draw) {
      event.draw(ctx, new Vector(0, 0), resolution);
    }
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
    return {
      "battle.action": (e: CustomEvent) => {
        this._herosTurn ? this._handleHeroAction(e) : this._handleFoeAction();
      },

      "actor.gainExp": (e: CustomEvent) => {
        const name = this._heroes.leader.displayAs;
        const exp = e.detail.exp;
        const levels = e.detail.levels;
        const abilities = e.detail.abilities;
        const dialogue = [`${name} gained ${exp} exp.`];

        levels.forEach((lvl: number) => {
          dialogue.push(`${name} grew to level ${lvl}!`);

          abilities
            .filter((ability: LearnedAbility) => ability.level === lvl)
            .forEach((ability: LearnedAbility) => {
              const instance = new AbilityFactory().createStrategy(ability.ref);

              dialogue.push(`${name} learned ${instance.displayAs}!`);
            });
        });

        const stream = new TextStream(dialogue);

        this._event_queue.push(
          new Dialogue(stream, undefined, [
            ...this._heroes.all(),
            ...this._foes.all(),
          ])
        );
        this.lock();
      },
    };
  }

  /**
   * Lock the battle and its menu
   *
   * @return if the lock was successful
   */
  public lock(): boolean {
    return this._menu.lock();
  }

  /**
   * Unlock the battle and its menu
   *
   * @return if the unlock was successful
   */
  public unlock(): boolean {
    return this._menu.unlock();
  }

  /** Cause game over */
  private _doGameOver() {
    const stream = new TextStream(["You died!"]);

    this._event_queue.push(
      new Dialogue(stream, this._heroes.leader, [
        ...this._heroes.all(),
        ...this._foes.all(),
      ])
    );

    this.lock();
  }

  /**
   * Run one cycle of the battle
   *
   * @emits battle.action
   */
  private _cycle() {
    this._herosTurn = !this._herosTurn;
    this._herosTurn ? this._heroes.cycle() : this._foes.cycle();

    if (!this._herosTurn) {
      bus.emit("battle.action");
    } else {
      this._opponentSelect.resolveSelected();
    }
  }

  /**
   * Handle battle action for the heroes
   *
   * @param e - battle action event
   */
  private _handleHeroAction(e: CustomEvent) {
    const opponent = this._opponentSelect.selected;

    if (e.detail?.strategy instanceof CombatStrategy) {
      const { leader } = this._heroes;

      const translation = opponent.position.minus(leader.position);
      const animation = createAnimation.translation({
        translation,
        duration_ms: 500,
      });
      const inverse_animation = createAnimation.translation({
        translation: translation.times(-1),
        duration_ms: 500,
      });

      this._event_queue.push(
        new AnimatedEntity(animation, leader),
        () => leader.attack(opponent, e.detail.strategy),
        new AnimatedEntity(inverse_animation, leader),
        () => this._handlePostTurn()
      );
    } else if (e.detail?.modifier instanceof StatModifier) {
      const target = e.detail.modifier.appliesToSelf
        ? this._heroes.leader
        : opponent;

      target.stats.modify(e.detail.modifier);
    }
  }

  /** Handle battle action for the foes */
  private _handleFoeAction() {
    const unarmed = new WeaponFactory().createStrategy("unarmed");

    this._foes.each((foe: Actor) => foe.attack(this._heroes.leader, unarmed));
    this._handlePostTurn();
  }

  /** Perform all necessary steps after any turn for heroes or foes */
  private _handlePostTurn() {
    if (this._heroes.areDefeated) {
      this._doGameOver();
    } else if (this._foes.areDefeated) {
      this._heroes.gainExp(this._foes.givesExp);
    } else {
      this._cycle();
    }
  }

  /**
   * End the battle
   *
   * @emits battle.end
   */
  public stop() {
    // Safety check added after making this a public method
    if (!this.isDone && this._event_queue.length > 0) {
      return;
    }

    this.unlock();

    this._heroes.each((hero: Actor) => hero.restorePosition());

    this._foes.each((foe: Actor) => {
      foe.restorePosition();

      /**
       * This logic is for when a player runs away from battle. We don't want to
       * kill off the leader if they have not been defeated yet.
       */
      if (foe.isDefeated || foe !== this._foes.leader) {
        foe.kill();
      }
    });

    bus.emit("battle.end");
    bus.unregister(this);

    this._menu.destroy();
    this.active = false;
  }

  /**
   * Draw the UI bar for the player
   *
   * @param ctx        - render context
   * @param resolution - render resolution
   */
  private _drawUiBar(ctx: CanvasRenderingContext2D, resolution: Vector) {
    const uiBarSize = this._getUiBarSize(resolution);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, uiBarSize.x, uiBarSize.y);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText("HP : " + this._heroes.leader.stats.hp, 16, 32);
  }

  /**
   * Draw the UI bar for the enemy
   *
   * @param ctx        - render context
   * @param resolution - render resolution
   */
  private _drawEnemyUiBar(ctx: CanvasRenderingContext2D, resolution: Vector) {
    const uiBarSize = this._getUiBarSize(resolution);
    const position = new Vector(resolution.x - uiBarSize.x, 0);

    ctx.fillStyle = "#000";
    ctx.fillRect(position.x, position.y, uiBarSize.x, uiBarSize.y);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText(
      "HP : " + this._opponentSelect.selected.stats.hp,
      position.x + 16,
      position.y + 32
    );
  }

  /**
   * Get the size of the UI bar based on screen resolution
   *
   * @param resolution - current screen resolution
   *
   * @return size of the UI bar
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
   * @return the battle menu
   */
  private _getBattleMenu(): BattleMenu {
    return new BattleMenu(menus.battle(this, () => this._heroes.leader));
  }
}

export default Battle;
