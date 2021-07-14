import AbilityFactory from "./strategy/AbilityFactory";
import Actor from "@/actor/Actor";
import BattleMenu from "@/menu/BattleMenu";
import CombatStrategy from "./strategy/CombatStrategy";
import Dialogue from "@/ui/Dialogue";
import HeroTeam from "./HeroTeam";
import OpponentSelect from "./OpponentSelect";
import StatModifier from "./strategy/StatModifier";
import StatModifierFactory from "./strategy/StatModifierFactory";
import Team from "./Team";
import TextStream from "@/ui/TextStream";
import Vector from "@common/Vector";
import WeaponFactory from "./strategy/WeaponFactory";
import { AnimatedText } from "@/ui/animation/text/AnimatedText";
import { Drawable, Eventful, Lockable, CallableMap } from "@/interfaces";
import { LearnedAbility } from "./strategy/types";
import { bus } from "@/EventBus";

class Battle implements Eventful, Drawable, Lockable {
  /**
   * Menu for the battle
   */
  private _menu: BattleMenu;

  /**
   * Dialogue in the battle
   */
  private _dialogue: Dialogue = null;

  /**
   * If it is currently the player's turn
   */
  private _herosTurn: boolean = true;

  /**
   * If the battle is locked
   */
  private _locked: boolean = false;

  /**
   * If the battle is currently active
   */
  public active: boolean;

  /**
   * Create a new battle instance
   *
   * @param _heroes         - heroes in battle
   * @param _foes           - enemies in battle
   * @param _opponentSelect - utility to traverse opponents in battle
   * @param _text_animation - animation sequence occurring in the battle
   *
   * @emits battle.action
   */
  constructor(
    private _heroes: HeroTeam,
    private _foes: Team,
    private _opponentSelect: OpponentSelect,
    private _text_animation: AnimatedText
  ) {
    this.active = true;

    // TODO: make these scale
    // TODO: Make this a enum direction
    this._heroes.prepare(4, new Vector(64, 128));
    this._foes.prepare(2, new Vector(256 + 64, 0));

    this._menu = this._getBattleMenu();

    bus.register(this);

    // Force enemy to attack if it is their turn first
    if (!this._herosTurn) {
      bus.emit("battle.action");
    }
  }

  /**
   * Determine if the battle is done
   */
  get isDone() {
    return this._heroes.areDefeated || this._foes.areDefeated;
  }

  /**
   * Update the battle
   *
   * @param dt - delta time
   */
  public update(dt: number) {
    if (this._text_animation) {
      this._text_animation.update(dt);

      if (this._text_animation.isDone) {
        this._text_animation = null;
      }
    }

    if (this._dialogue) {
      this._dialogue.update(dt);
    }

    this._menu.wantsCombat
      ? this._opponentSelect.unlock()
      : this._opponentSelect.lock();

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
    const player = this._heroes.leader;

    ctx.fillStyle = "#CCC";
    ctx.fillRect(0, 0, width, height);

    this._heroes.draw(ctx, offset, resolution);
    this._foes.draw(ctx, offset, resolution);

    this._drawUiBar(ctx, resolution);
    this._drawEnemyUiBar(ctx, resolution);

    if (this._herosTurn) {
      const menuOffset = offset.plus(player.position).plus(player.size);

      this._menu.draw(ctx, menuOffset, resolution);

      if (!this._opponentSelect.isLocked) {
        this._opponentSelect.draw(ctx, offset, resolution);
      }
    }

    if (this._dialogue) {
      this._dialogue.draw(ctx, new Vector(0, 0), resolution);
    }

    if (this._text_animation) {
      this._text_animation.draw(ctx, new Vector(0, 0), resolution);
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
        let abilities = e.detail.abilities;
        let dialogue = [`${name} gained ${exp} exp.`];

        levels.forEach((lvl: number) => {
          dialogue.push(`${name} grew to level ${lvl}!`);

          abilities
            .filter((ability: LearnedAbility) => ability.level === lvl)
            .forEach((ability: LearnedAbility) => {
              const instance = new AbilityFactory().createStrategy(ability.ref);

              dialogue.push(`${name} learned ${instance.displayAs}!`);
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
   * @return if the lock was successful
   */
  public lock(): boolean {
    this._locked = true;
    return this._menu.lock();
  }

  /**
   * Unlock the battle and its menu
   *
   * @return if the unlock was successful
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
      this._heroes.leader.attack(opponent, e.detail.strategy);
    } else if (e.detail?.modifier instanceof StatModifier) {
      const target = e.detail.modifier.appliesToSelf
        ? this._heroes.leader
        : opponent;

      target.stats.modify(e.detail.modifier);
    }
  }

  /**
   * Handle battle action for the foes
   */
  private _handleFoeAction() {
    const unarmed = new WeaponFactory().createStrategy("unarmed");

    this._foes.each((foe: Actor) => foe.attack(this._heroes.leader, unarmed));
  }

  /**
   * End the battle
   *
   * @emits battle.end
   */
  private _stop() {
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
   * TODO: consider moving this to a factory
   *
   * @return the battle menu
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
        type: "Abilities",
        menu: player.abilities,
      },
      {
        type: "Other",
        menu: [
          new StatModifierFactory().createModifier("defend"),
          {
            displayAs: "Run Away",
            use: () => {
              this._stop();
            },
          },
        ],
      },
    ]);
  }
}

export default Battle;
