import AbilityFactory from "@/combat/strategy/AbilityFactory";
import CombatStrategy from "@/combat/strategy/CombatStrategy";
import Damage from "@/combat/Damage";
import Dialogue from "@/ui/Dialogue";
import Inanimate from "@/inanimate/Inanimate";
import MissingDataError from "@/error/MissingDataError";
import StateManager from "@/state/StateManager";
import Stats from "@/Stats";
import UnimplementedMethodError from "@/error/UnimplementMethodError";
import Vector from "@common/Vector";
import Weapon from "@/combat/strategy/Weapon";
import actors from "./actors";
import config from "@/config";
import { Collision } from "@/CollisionHandler";
import { Drawable, Lockable } from "@/interfaces";
import { LearnedAbility } from "@/combat/strategy/types";
import { RenderData } from "@/ui/types";
import { getImagePath } from "@/util";

/**
 * General purpose entity that interacts with fixtures in the game
 */
type Entity = Actor | Inanimate;

/**
 * Base class for entities that affect change within the game
 */
abstract class Actor implements Drawable, Lockable {
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
  private savedDirection: number;

  /**
   * Unique identifier
   */
  protected _id: string;

  /**
   * Game-related info about the actor
   */
  protected config: any;

  /**
   * Dialogue that the actor is the leader of
   */
  protected dialogue: Dialogue = null;

  /**
   * If the actor has been defeated
   */
  protected _defeated: boolean = false;

  /**
   * If the actor is locked from updating
   */
  protected locked: boolean;

  /**
   * Current position of the actor
   */
  public position: Vector;

  /**
   * An actor's stats
   */
  public stats: Stats;

  /**
   * The weapon currently equipped to the actor
   */
  public weapon: Weapon;

  /**
   * Direction the actor is currently facing
   *
   * 1 = north; 2 = west; 3 = south; 4 = east;
   */
  public direction: number;

  /**
   * If the actor is in dialogue
   */
  public inDialogue: boolean;

  /**
   * Create a new Actor-based instance
   *
   * @param position - positon of the actor
   * @param size     - size of the actor
   * @param data     - additional info about the actor
   *
   * @throws {MissingDataError} when name, type, or config are missing
   */
  constructor(position: Vector, private _size: Vector, protected data: any) {
    let actorType = this.constructor.name;

    if (!data?.name) {
      throw new MissingDataError(`Missing unique identifier for ${actorType}.`);
    }

    if (!data?.type) {
      throw new MissingDataError(`Missing "type" for ${actorType}.`);
    }

    this.config = actors[data.type];

    if (this.config.baseStats) {
      this.stats = new Stats(this.config.baseStats);
    }

    if (!this.config) {
      throw new MissingDataError(
        `Config data for ${actorType} is not defined in actors.json`
      );
    }

    if (data.properties) {
      this.assignCustomProperties(data.properties);
    }

    this._id = data.name;
    this.position = position.times(config.scale);
    this.direction = 0;
    this.inDialogue = false;
    this.locked = false;
    this.lastPosition = this.position.copy();
    this.savedPosition = this.position.copy();
    this.savedDirection = this.direction;
  }

  /**
   * Get the actor's id
   */
  get id() {
    return this._id;
  }

  /**
   * Get the actor's defeated status
   */
  get isDefeated() {
    return this._defeated || this.stats.hp <= 0;
  }

  /**
   * Get the actor's size
   */
  get size(): Vector {
    return this._size;
  }

  /**
   * Get the name used when rendering dialogue
   */
  get displayAs(): string {
    return this.config.displayAs;
  }

  /**
   * Get the abilities the actor currently knows
   */
  get abilities(): CombatStrategy[] {
    return this._getAllAbilities()
      .filter((ability) => ability.level <= this.stats.lvl)
      .map((ability) => new AbilityFactory().createStrategy(ability.ref));
  }

  /**
   * Update the actor
   *
   * @param dt - delta time
   */
  public update(dt: number) {
    if (this.locked) {
      return;
    }

    this.lastPosition = this.position.copy();
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
  }

  /**
   * Helper method to change the actor's position
   *
   * @param position - position to move to
   */
  public moveTo(position: Vector) {
    this.position = position.copy();
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
    let prevCollisionPoint = this.collisionPoint(true);

    if (collision) {
      if (
        prevCollisionPoint.x < collision.position.x ||
        prevCollisionPoint.x > collision.position.x + collision.size.x
      ) {
        this.position.x = this.lastPosition.x;
      } else {
        this.position.y = this.lastPosition.y;
      }
    } else {
      this.moveTo(this.lastPosition);
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
    let collisionPoint = this.collisionPoint();

    let collision =
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
  public savePosition(useLast: boolean = false) {
    this.savedPosition = useLast
      ? this.lastPosition.copy()
      : this.position.copy();

    this.savedDirection = this.direction;
  }

  /**
   * Restore the actor's saved position
   *
   * @param unlock - if the actor should be unlocked too
   */
  public restorePosition(unlock: boolean = true) {
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

  /**
   * Kill off the actor
   *
   * @throws {UnimplementedMethodError} this should never be called directly
   */
  public kill() {
    throw new UnimplementedMethodError(
      `Actor "${this.constructor.name}" must implement kill method.`
    );
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
  protected resolveState(ref: string): any {
    const state = StateManager.getInstance();

    let stateManagerData = state.get(ref);

    if (stateManagerData === undefined) {
      state.mergeByRef(ref, this.getState());
      return state.get(ref);
    }

    ["lvl", "exp", "dmg"].forEach((stat) => {
      if (stateManagerData?.[stat]) {
        this.stats[stat] = stateManagerData[stat];
      }
    });

    if (stateManagerData?.defeated) {
      this._defeated = stateManagerData.defeated;
    }

    return stateManagerData;
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
   * Get current state of the actor for export to a state manager
   *
   * @return current state of the actor
   */
  protected getState(): object {
    return {
      type: this.data.type,
      defeated: this._defeated,
      dmg: this.stats.dmg,
      lvl: this.stats.lvl,
    };
  }

  /**
   * Retrieve a collision coordinate within the area of the actor
   *
   * TODO: Reconsider the hardcoded values here
   *
   * @param prev - use previous position instead of current position
   */
  private collisionPoint(prev: boolean = false): Vector {
    return new Vector(
      (prev ? this.lastPosition.x : this.position.x) + this.size.x * 0.5,
      (prev ? this.lastPosition.y : this.position.y) + this.size.y * 0.8
    );
  }

  /**
   * Assign custom properties from the input data to the actor
   *
   * @param props - list of properties
   */
  private assignCustomProperties(props: any[]) {
    let lvl = props.filter((prop) => prop.name === "lvl")[0]?.value;

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
    let position = this.position.plus(offset);

    ctx.save();
    ctx.strokeStyle = "#F00";
    ctx.strokeRect(position.x, position.y, this.size.x, this.size.y);
    ctx.restore();
  }
}

export default Actor;
