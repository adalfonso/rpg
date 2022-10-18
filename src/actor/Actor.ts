import * as Tiled from "@excaliburjs/plugin-tiled";
import * as ex from "excalibur";
import AbilityFactory from "@/combat/strategy/AbilityFactory";
import CombatStrategy from "@/combat/strategy/CombatStrategy";
import Damage from "@/combat/Damage";
import Dialogue from "@/ui/dialogue/Dialogue";
import MissingDataError from "@/error/MissingDataError";
import Stats from "@/actor/Stats";
import Weapon from "@/combat/strategy/Weapon";
import config from "@/config";
import { AbilityList, LearnedAbility } from "@/combat/strategy/types";
import { ActorConfig, TiledClassObject } from "./types";
import { ActorState, isActorState } from "@schema/actor/ActorSchema";
import { Direction, RenderData } from "@/ui/types";
import { Lockable, Stateful } from "@/interfaces";
import { Movable, Resizable } from "@/physics/Entity";
import { MultiSprite, SpriteOrientation } from "@/ui/MultiSprite";
import { Nullable } from "@/types";
import { actors } from "./actors";
import { getImagePath } from "@/util";
import { state } from "@/state/StateManager";

/** Base class for entities that affect change within the game */
export abstract class Actor
  extends MultiSprite(Resizable(Movable(ex.Actor)))
  implements Lockable, Stateful<ActorState>
{
  /** Battle abilities */
  private _abilities: AbilityList[];

  /** Unique identifier */
  protected _id: string;

  /** Game-related info about the actor */
  protected config: ActorConfig;

  /** Dialogue that the actor is the leader of */
  protected dialogue: Nullable<Dialogue> = null;

  /** If the actor has been defeated */
  protected _defeated = false;

  /** If the actor is locked from updating */
  protected locked: boolean;

  /** An actor's stats */
  protected _stats: Stats;

  /** The weapon currently equipped to the actor */
  public weapon: Nullable<Weapon> = null;

  /** If the actor is in dialogue */
  public inDialogue: boolean;

  /**
   * Create a new Actor-based instance
   *
   * @param _template - info about the actor
   * @param args - standard excalibur Actor args
   *
   * @throws {MissingDataError} when name, type, or config are missing
   */
  constructor(
    protected _template: TiledClassObject,
    args: ex.ActorArgs = {},
    game: ex.Engine
  ) {
    super({ ..._template, ...args });

    this.config = actors()[_template.class];

    if (!this.config) {
      throw new MissingDataError(
        `Config data for Actor "${_template.class}" is not defined in actors.ts`
      );
    }

    this._stats = new Stats(this.config.base_stats);

    if (_template.properties) {
      this.assignCustomProperties(_template.properties);
    }

    this._id = _template.name;
    this.inDialogue = false;
    this.locked = false;

    game.add(this);

    this._setSprites(this.getUiInfo(), this._template).then((scale) => {
      this.graphics.use(this.sprites[Direction.South]);

      if (scale !== 1) {
        this.actions.scaleTo(ex.vec(scale, scale), ex.vec(Infinity, Infinity));
      }
    });

    this._abilities = this._getAllAbilities().map(({ ref, level }) => ({
      level,
      ability: new AbilityFactory().createStrategy(ref),
    }));
  }

  // TODO: wtf this. We need better consistency for ref, displayAs, etc
  /** Get the actor's id */
  get ref_id() {
    return this._id;
  }

  /** Get the actor's defeated status */
  get isDefeated() {
    return this._defeated || this.stats.hp <= 0;
  }

  /** Get the name used when rendering dialogue */
  get displayAs() {
    return this.config.displayAs;
  }

  /** An actor's stats, e.g. hp, def, atk */
  get stats() {
    return this._stats;
  }

  /** State lookup key */
  get state_ref() {
    return this._template.class;
  }

  /** Current data state */
  get state(): ActorState {
    return {
      class: this._template.class,
      defeated: this._defeated,
      dmg: this.stats.dmg,
      lvl: this.stats.lvl,
    };
  }

  /**
   * Get the actor's template
   *
   * Useful when creating different extensions of an actor, NPCs, players, etc.
   */
  get template() {
    return this._template;
  }

  /** Get the abilities the actor currently knows */
  get abilities(): CombatStrategy[] {
    return this._abilities
      .filter((ability) => ability.level <= this.stats.lvl)
      .map((ability) => ability.ability);
  }

  /**
   * Lock the menu
   *
   * @return if lock was successful
   */
  public lock(): boolean {
    this.locked = true;

    return true;
  }

  /**
   * Unlock the menu
   *
   * @return if unlock was successful
   */
  public unlock(): boolean {
    // Do not unlock the actor while they are still in dialogue
    if (!this.inDialogue) {
      this.locked = false;

      return true;
    }

    return false;
  }

  /**
   * Allow the actor to attack another actor
   *
   * Allow the weapon to be specified, and fall back to the actor's weapon when
   * it's not.
   *
   * @param target   - other actor to attack
   * @param strategy - strategy to use for attack
   */
  public async attack(target: Actor, strategy: CombatStrategy) {
    if (!strategy && this.weapon) {
      strategy = this.weapon;
    }

    target.endure(strategy.damage.augment(this.stats));
  }

  /**
   * Receive an amount of damage
   *
   * @param damage - amount of damage to receive
   */
  public endure(damage: Damage) {
    this.stats.endure(damage);
  }

  /** Kill off the actor */
  public abstract kill(): void;

  /**
   * Equip a weapon
   *
   * @param weapon - weapon to equip
   */
  protected equip(weapon: Weapon) {
    if (weapon === this.weapon) {
      return;
    }

    this.unequip();
    this.weapon = weapon;
  }

  /** Unequip a weapon */
  protected unequip() {
    if (!this.weapon) {
      return;
    }

    /**
     * The weapon should already be unequipped because that invocation is what
     * should have caused this unequip to bubble up. If for some reason it
     * hasn't been unequiped on the weapon (unknown reason), then we want to
     * ensure it has been. We also want to only unequip from the weapon when
     * needed to, to avoid an infinite loop.
     */
    if (this.weapon.isEquipped) {
      this.weapon.unequip();
    }

    this.weapon = null;
  }

  /**
   * Resolve the current state of the actor in comparison to the game state
   *
   * TODO: Tie the ref to the actor better, it's currently a little loosey goosey
   *
   * @param ref - reference to where in the state the actor is stored
   *
   * @return actor data as stored in the state
   */
  protected _resolveState<T extends ActorState>(
    guard?: (data: unknown) => data is T
  ) {
    const data = state().resolve(this, guard ?? isActorState);
    const { lvl, dmg, defeated } = data;

    this.stats.lvl = lvl;
    this.stats.dmg = dmg;
    this._defeated = defeated;

    return data;
  }

  /**
   * Get all of the actor's abilities
   *
   * @return all the actor's abilities
   */
  protected _getAllAbilities(): LearnedAbility[] {
    return this.config.abilities ?? [];
  }

  /**
   * Get render info from an actor's config
   *
   * @return inputs for a renderable
   */
  protected getUiInfo(): RenderData {
    const UI = this.config.ui;

    return {
      fps: UI.fps,
      columns: UI.columns,
      rows: UI.rows,
      scale: UI.scale * config.scale,
      sprite: getImagePath(UI.sprite),
      sprite_orientation: UI.sprite_orientation ?? SpriteOrientation.Clockwise,
    };
  }

  /**
   * Assign custom properties from the input data to the actor
   *
   * @param props - list of properties
   */
  private assignCustomProperties(props: Tiled.TiledProperty[]) {
    const lvl = props.filter((prop) => prop.name === "lvl")[0]?.value;

    if (lvl && this.stats) {
      this.stats.lvl = +lvl;
    }
  }
}
