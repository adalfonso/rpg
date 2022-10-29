import * as ex from "excalibur";
import AbilityFactory from "./strategy/AbilityFactory";
import CombatStrategy from "./strategy/CombatStrategy";
import OpponentSelect from "./OpponentSelect";
import StatModifier from "./strategy/StatModifier";
import Team from "./Team";
import TextStream from "@/ui/dialogue/TextStream";
import WeaponFactory from "./strategy/WeaponFactory";
import menus from "@/menu/menus";
import { Actor } from "@/actor/Actor";
import { AdHocCanvas } from "@/ui/AdHocCanvas";
import { AnimatedEntity } from "@/ui/animation/text/AnimatedEntity";
import { AnimatedText } from "@/ui/animation/text/AnimatedText";
import { BattleMenu } from "@/menu/BattleMenu";
import { Dialogue } from "@/ui/dialogue/Dialogue";
import { Direction } from "@/ui/types";
import { Enemy } from "@/actor/Enemy";
import { HeroTeam } from "./HeroTeam";
import { LearnedAbility } from "./strategy/types";
import { Lockable } from "@/interfaces";
import { MenuType } from "@/menu/types";
import { Vector } from "excalibur";
import { bus, EventType } from "@/event/EventBus";
import { createAnimation } from "@/ui/animation/CreateAnimation";
import { createSubMenu } from "@/menu/MenuFactory";

interface BattleEvent {
  isDone: boolean;
  update(dt: number): void;
  draw?(ctx: ex.ExcaliburGraphicsContext, resolution: Vector): void;
  draw2D?(ctx: CanvasRenderingContext2D, resolution: Vector): void;
}

const isBattleEvent = (event: unknown): event is BattleEvent =>
  typeof event === "object" &&
  event !== null &&
  typeof event["isDone"] === "boolean" &&
  event["update"] instanceof Function;

class Battle extends ex.Scene implements Lockable {
  /** Menu for the battle */
  private _menu: BattleMenu;

  /** If it is currently the player's turn */
  private _herosTurn = true;

  /** Queue of animations and battle actions to execute */
  private _event_queue: (BattleEvent | (() => void))[] = [];

  /** Canvas for rendering 2D */
  private _pre_canvas = new AdHocCanvas();

  /** Canvas for rendering 2D */
  private _post_canvas = new AdHocCanvas();

  /** If the battle is currently active */
  public active: boolean;

  /**
   * Create a new battle instance
   *
   * @param _heroes         - heroes in battle
   * @param _foes           - enemies in battle
   * @param _opponentSelect - utility to traverse opponents in battle
   * @param intro_animation - animation sequence occurring at the start of battle
   *
   * @emits battle.action
   */
  constructor(
    private _heroes: HeroTeam,
    private _foes: Team<Enemy>,
    private _opponentSelect: OpponentSelect,
    intro_animation: AnimatedText
  ) {
    super();
    this.active = true;
    this._event_queue.push(
      () => this.lock(),
      intro_animation,
      () => this.unlock()
    );

    // TODO: make these scale
    this._heroes.prepare(Direction.East, new Vector(512, 256));
    this._heroes.each((hero) => this.add(hero));

    this._foes.prepare(Direction.West, new Vector(256 + 512 + 64, 128));
    this._foes.each((foe) => this.add(foe));

    this._menu = this._getBattleMenu();

    this._moveBattleMenu();

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
  public update(engine: ex.Engine, dt: number) {
    super.update(engine, dt);

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
   * Draw and all underlying entities
   *
   * @param ectx - render context
   * @param resolution - render resolution
   */
  public drawPre(ectx: ex.ExcaliburGraphicsContext, resolution: ex.Vector) {
    this._pre_canvas.draw(
      ectx,
      resolution,
      (ctx: CanvasRenderingContext2D, resolution: ex.Vector) => {
        ctx.fillStyle = "#CCC";
        ctx.fillRect(0, 0, resolution.x, resolution.y);
      }
    );
  }

  /**
   * Draw and all underlying entities
   *
   * @param ctx - render context
   * @param resolution - render resolution
   */
  public drawPost(ectx: ex.ExcaliburGraphicsContext, resolution: ex.Vector) {
    this._post_canvas.draw(
      ectx,
      resolution,
      (ctx: CanvasRenderingContext2D, resolution: ex.Vector) => {
        if (this._herosTurn && !this.isDone) {
          this._menu.draw(ectx, resolution);

          if (!this._opponentSelect.isLocked) {
            this._opponentSelect.draw(ctx, ex.Vector.Zero, resolution);
          }
        }

        const [event] = this._event_queue;

        if (isBattleEvent(event) && event?.draw) {
          event.draw(ectx, resolution);
        }

        if (isBattleEvent(event) && event?.draw2D) {
          event.draw2D(ctx, resolution);
        }

        this._drawUiBar(ctx, resolution);
        this._drawEnemyUiBar(ctx, resolution);
      }
    );
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Custom]: {
        "battle.action": (e: CustomEvent) => {
          // Cancel if the player's combat strategy emits before their turn ends
          if (this._event_queue.length && e?.detail?.strategy) {
            return;
          }

          this._herosTurn ? this._handleHeroAction(e) : this._handleFoeAction();
        },

        "actor.gainExp": (e: CustomEvent) => {
          const name = e.detail.actor.displayAs;
          const exp = e.detail.exp;
          const levels = e.detail.levels;
          const abilities = e.detail.abilities;
          const dialogue = [`${name} gained ${exp} exp.`];

          levels.forEach((lvl: number) => {
            dialogue.push(`${name} grew to level ${lvl}!`);

            abilities
              .filter((ability: LearnedAbility) => ability.level === lvl)
              .forEach((ability: LearnedAbility) => {
                const instance = new AbilityFactory().createStrategy(
                  ability.ref
                );

                dialogue.push(`${name} learned ${instance.displayAs}!`);
              });
          });

          bus.emit("team.save");

          const stream = new TextStream(dialogue);

          this._event_queue.push(
            new Dialogue(stream, null, [
              ...this._heroes.all(),
              ...this._foes.all(),
            ])
          );
          this.lock();
        },
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

  /** Move the battle menu to where it should be */
  private _moveBattleMenu() {
    const hero = this._heroes.nextToTakeTurn;
    this._menu.reset();
    this._menu.moveTo(hero.position.add(hero.size));
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
    }
  }

  /**
   * Handle battle action for the heroes
   *
   * @param e - battle action event
   */
  private _handleHeroAction(e: CustomEvent) {
    const opponent = this._opponentSelect.selected;
    const hero = this._heroes.nextToTakeTurn;

    if (e.detail?.strategy instanceof CombatStrategy) {
      const animation = createAnimation.translation({
        translation: opponent.position.sub(hero.position),
        duration_ms: 500,
      });
      const inverse_animation = createAnimation.translation({
        translation: opponent.position.sub(hero.position).scale(-1),
        duration_ms: 500,
      });

      this._event_queue.push(
        new AnimatedEntity(animation, hero),
        () => hero.attack(opponent, e.detail.strategy),
        new AnimatedEntity(inverse_animation, hero)
      );
    } else if (e.detail?.modifier instanceof StatModifier) {
      const target = e.detail.modifier.appliesToSelf ? hero : opponent;

      target.stats.modify(e.detail.modifier);
    }

    this._event_queue.push(
      () => this._heroes.takeTurn(hero),
      // Handle post turn ops if turn is over or game has ended
      () => (this._heroes.turnIsOver || this.isDone) && this._handlePostTurn(),
      // Adjust menu unless turn is over
      () => this._moveBattleMenu(),
      () => this._opponentSelect.resolveSelected()
    );
  }

  /** Handle battle action for the foes */
  private _handleFoeAction() {
    const unarmed = new WeaponFactory().createStrategy("unarmed");
    const foe = this._foes.nextToTakeTurn;
    const target_hero =
      this._heroes.all().filter((hero) => !hero.isDefeated)[0] ??
      this._heroes.leader;

    const animation = createAnimation.translation({
      translation: target_hero.position.sub(foe.position),
      duration_ms: 500,
    });
    const inverse_animation = createAnimation.translation({
      translation: target_hero.position.sub(foe.position).scale(-1),
      duration_ms: 500,
    });

    const onAttackEnd = () => {
      this._foes.takeTurn(foe);

      this._foes.turnIsOver ? this._handlePostTurn() : this._handleFoeAction();
    };

    this._event_queue.push(
      new AnimatedEntity(animation, foe),
      () => foe.attack(target_hero, unarmed),
      new AnimatedEntity(inverse_animation, foe),
      () => target_hero.isDefeated && target_hero.kill(),
      onAttackEnd
    );
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

    this._heroes.each((hero: Actor) => {
      hero.restorePosition();
      hero.restoreDirection();
    });

    this._foes.each((foe: Actor) => {
      foe.restorePosition();
      foe.restoreDirection();

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

    /**
     * When the last player has taken their turn we will still need to reference
     * them for the drawing of the ui bar. In this case we fall back to the last
     * player to take their turn
     */
    const hero = this._heroes.nextToTakeTurn || this._heroes.previousToTakeTurn;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, uiBarSize.x, uiBarSize.y);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText("HP : " + hero.stats.hp, 16, 32);
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
  private _getBattleMenu() {
    return new BattleMenu(
      createSubMenu(MenuType.Battle)(
        menus.battle(this, () => this._heroes.nextToTakeTurn)
      )
    );
  }
}

export default Battle;
