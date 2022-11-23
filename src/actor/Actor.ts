import * as Tiled from "@excaliburjs/plugin-tiled";
import * as ex from "excalibur";
import AbilityFactory from "@/combat/strategy/AbilityFactory";
import CombatStrategy from "@/combat/strategy/CombatStrategy";
import Damage from "@/combat/Damage";
import MissingDataError from "@/error/MissingDataError";
import Stats from "@/actor/Stats";
import Weapon from "@/combat/strategy/Weapon";
import { AbilityList, LearnedAbility } from "@/combat/strategy/types";
import { ActorConfig, TiledTemplate } from "./types";
import { ActorState, isActorState } from "@schema/actor/ActorSchema";
import { Direction, RenderData } from "@/ui/types";
import { Lockable, Stateful } from "@/interfaces";
import { Movable, Resizable } from "@/actor/Entity";
import { MultiSprite, SpriteOrientation } from "@/ui/MultiSprite";
import { Nullable } from "@/types";
import { actors } from "./actors";
import { getImagePath, scale } from "@/util";
import { state } from "@/state/StateManager";

/** Base class for entities that affect change within the game */
export abstract class Actor
  extends MultiSprite(Resizable(Movable(ex.Actor)))
  implements Lockable, Stateful<ActorState>
{
  /** Saves velocity while actor is locked */
  private _saved_velocity = ex.Vector.Zero;

  /** Battle abilities */
  private _abilities: AbilityList[];

  /** Game-related info about the actor */
  protected config: ActorConfig;

  /** If the actor has been defeated */
  protected _defeated = false;

  /** If the actor is locked from updating */
  protected locked = false;

  /** An actor's stats */
  protected _stats: Stats;

  /** The weapon currently equipped to the actor */
  public weapon: Nullable<Weapon> = null;

  /** If the actor is in dialogue */
  public in_dialogue = false;

  /** If the actor is in combat */
  public in_combat = false;

  /** Saved Collision Type */
  private _saved_collision_type: Nullable<ex.CollisionType> = null;

  /**
   * Create a new Actor-based instance
   *
   * @param _template - info about the actor
   * @param args - standard excalibur Actor args
   *
   * @throws {MissingDataError} when name, type, or config are missing
   */
  constructor(protected _template: TiledTemplate, args: ex.ActorArgs = {}) {
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

    this._abilities = this._getAllAbilities().map(({ ref, level }) => ({
      level,
      ability: new AbilityFactory().createStrategy(ref),
    }));
  }

  /** General lookup key */
  get ref() {
    return this._template.name;
  }

  /**
   * Run additional async init stuff
   *
   * @returns instance
   */
  public async init() {
    await this._setSprites(this.getUiInfo(), this._template);
    this.direction = Direction.South;

    return this;
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

  /** Lock the menu */
  public lock() {
    this.locked = true;
    this._saved_velocity = this.vel.clone();
    this.vel = ex.Vector.Zero;
  }

  /** Unlock the menu */
  public unlock() {
    // Do not unlock the actor while they are still in dialogue
    if (this.in_dialogue) {
      return;
    }

    this.locked = false;
    this.vel = this._saved_velocity.clone();
    this._saved_velocity = ex.Vector.Zero;
  }

  /**
   * Prepare the actor for battle
   *
   * @param direction - direction actor should face
   */
  public onBattleStart(direction: Direction) {
    this._savePosition();
    this._saveDirection();
    this._saveCollisionType();
    this.direction = direction;
    this.in_combat = true;
    this.body.collisionType = ex.CollisionType.Passive;
    this.lock();
  }

  /** Restore the actor's properties for the overworld */
  public onBattleEnd() {
    this._restorePosition();
    this._restoreDirection();
    this._restoreCollisionType();
    this.in_combat = false;
    this.unlock();
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
   * @return inputs for a rendering
   */
  protected getUiInfo(): RenderData {
    const UI = this.config.ui;

    return {
      fps: UI.fps,
      columns: UI.columns,
      rows: UI.rows,
      scale: scale(UI.scale),
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

    if (lvl && typeof lvl === "string" && this.stats) {
      this.stats.lvl = +lvl;
    }
  }

  /* Save the collision type of the actor so it can be used later */
  private _saveCollisionType() {
    this._saved_collision_type = this.body.collisionType;
  }

  /** Restore the position of the actor */
  private _restoreCollisionType() {
    this.body.collisionType =
      this._saved_collision_type ?? ex.CollisionType.Active;
    this._saved_collision_type = null;
  }
}
