import AbilityFactory from "@/combat/strategy/AbilityFactory";
import CombatStrategy from "@/combat/strategy/CombatStrategy";
import Damage from "@/combat/Damage";
import Dialogue from "@/ui/dialogue/Dialogue";
import Inanimate from "@/inanimate/Inanimate";
import MissingDataError from "@/error/MissingDataError";
import Stats from "@/actor/Stats";
import Vector from "@/physics/math/Vector";
import Weapon from "@/combat/strategy/Weapon";
import config from "@/config";
import { AbilityList, LearnedAbility } from "@/combat/strategy/types";
import { ActorConfig } from "./types";
import { ActorState, isActorState } from "@schema/actor/ActorSchema";
import { Collision } from "@/physics/CollisionHandler";
import { Direction, RenderData } from "@/ui/types";
import { Drawable, Lockable, Stateful } from "@/interfaces";
import { Empty } from "@/mixins";
import { Movable, Resizable } from "@/physics/Entity";
import { MultiSprite } from "@/ui/MultiSprite";
import { Nullable } from "@/types";
import { actors } from "./actors";
import { getImagePath } from "@/util";
import { state } from "@/state/StateManager";
import {
  LevelFixtureProperty,
  LevelFixtureTemplate,
} from "@/level/LevelFixture";

/** General purpose entity that interacts with fixtures in the game */
type Entity = Actor | Inanimate;

/** Base class for entities that affect change within the game */
export abstract class Actor
  extends MultiSprite(Resizable(Movable(Empty)))
  implements Drawable, Lockable, Stateful<ActorState>
{
  /**
   * The position the actor was previously at
   *
   * This becomes handy if the actor has a collision and needs to take a step
   * back.
   */
  private lastPosition: Vector;

  /**
   * Long-term saved position of the actor
   *
   * Recorded in case we need to restore the position after some period of time.
   */
  private savedPosition: Vector;

  /**
   * Long-term saved direction of the actor
   *
   * Recorded in case we need to restore the direction the actor was facing
   * after some period of time.
   */
  private savedDirection: Direction;

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
   * @param _position - positon of the actor
   * @param _size     - size of the actor
   * @param _template - additional info about the actor
   *
   * @throws {MissingDataError} when name, type, or config are missing
   */
  constructor(
    protected _position: Vector,
    protected _size: Vector,
    protected _template: LevelFixtureTemplate
  ) {
    super();

    this.config = actors()[_template.type];

    if (!this.config) {
      throw new MissingDataError(
        `Config data for Actor "${_template.type}" is not defined in actors.ts`
      );
    }

    this._stats = new Stats(this.config.base_stats);

    if (_template.properties) {
      this.assignCustomProperties(_template.properties);
    }

    this._id = _template.name;
    this.direction = Direction.None;
    this.inDialogue = false;
    this.locked = false;
    this.lastPosition = this._position.copy();
    this.savedPosition = this._position.copy();
    this.savedDirection = this.direction;

    this._setSprites(this.getUiInfo());

    this._abilities = this._getAllAbilities().map(({ ref, level }) => ({
      level,
      ability: new AbilityFactory().createStrategy(ref),
    }));
  }

  // TODO: wtf this. We need better consistency for ref, displayAs, etc
  /** Get the actor's id */
  get id() {
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
    return this._template.type;
  }

  /** Current data state */
  get state(): ActorState {
    return {
      type: this._template.type,
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
   * Update the actor
   *
   * @param dt - delta time
   */
  public update(_dt: number) {
    if (this.locked) {
      return;
    }

    this.lastPosition = this._position.copy();
  }

  /**
   * Draw actor and all underlying entities
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
    if (config.debug) {
      this.debugDraw(ctx, offset, resolution);
    }

    this.sprites[this.direction].draw(ctx, this._position.plus(offset));
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
   * Backstep the actor
   *
   * If a collision happens, try backstepping in only one direction. Otherwise,
   * just revert to the last position.
   *
   * @param collision - collision to consider
   */
  public backstep(collision?: Collision) {
    if (!collision) {
      return this.moveTo(this.lastPosition);
    }

    const prevCollisionPoint = this.collisionPoint(true);

    if (
      prevCollisionPoint.x < collision.position.x ||
      prevCollisionPoint.x > collision.position.x + collision.size.x
    ) {
      this._position = new Vector(this.lastPosition.x, this._position.y);
    } else {
      this._position = new Vector(this.position.x, this.lastPosition.y);
    }
  }

  /**
   * Determine if the actor collides with another entity
   *
   * Check if the actor's collision point is inside of the entity
   *
   * @param entity - entity to check collision with
   *
   * @return collision indicator
   */
  public collidesWith(entity: Entity): Collision | false {
    const collisionPoint = this.collisionPoint();

    const collision =
      collisionPoint.x > entity.position.x &&
      collisionPoint.x < entity.position.x + entity.size.x &&
      collisionPoint.y > entity.position.y &&
      collisionPoint.y < entity.position.y + entity.size.y;

    if (collision) {
      return {
        position: entity.position.copy(),
        size: entity.size.copy(),
      };
    }

    return false;
  }

  /**
   * Save the actor's position for later usage
   *
   * @param - whether to use the last position instead of the current
   */
  public savePosition(useLast = false) {
    this.savedPosition = useLast
      ? this.lastPosition.copy()
      : this._position.copy();

    this.savedDirection = this.direction;
  }

  /**
   * Restore the actor's saved position
   *
   * @param unlock - if the actor should be unlocked too
   */
  public restorePosition(unlock = true) {
    this.moveTo(this.savedPosition);
    this.direction = this.savedDirection;

    if (unlock) {
      this.unlock();
    }
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

    if (this.weapon) {
      this.weapon.unequip();
    }

    this.weapon = weapon;
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
      frames: UI.frames,
      ratio: new Vector(UI.frames.x, UI.frames.y),
      scale: UI.scale * config.scale,
      sprite: getImagePath(UI.sprite),
    };
  }

  /**
   * Retrieve a collision coordinate within the area of the actor
   *
   * TODO: Reconsider the hardcoded values here
   *
   * @param prev - use previous position instead of current position
   */
  private collisionPoint(prev = false): Vector {
    return new Vector(
      (prev ? this.lastPosition.x : this._position.x) + this.size.x * 0.5,
      (prev ? this.lastPosition.y : this._position.y) + this.size.y * 0.8
    );
  }

  /**
   * Assign custom properties from the input data to the actor
   *
   * @param props - list of properties
   */
  private assignCustomProperties(props: LevelFixtureProperty[]) {
    const lvl = props.filter((prop) => prop.name === "lvl")[0]?.value;

    if (lvl && this.stats) {
      this.stats.lvl = +lvl;
    }
  }

  /**
   * Force some sort of render when debug mode is on
   *
   * @param ctx         - render context
   * @param offset      - render position offset
   * @param _resolution - render resolution
   */
  private debugDraw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    _resolution: Vector
  ) {
    const position = this._position.plus(offset);

    ctx.save();
    ctx.strokeStyle = "#F00";
    ctx.strokeRect(position.x, position.y, this.size.x, this.size.y);
    ctx.restore();
  }
}

export default Actor;
