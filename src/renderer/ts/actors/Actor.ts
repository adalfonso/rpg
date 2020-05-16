import Dialogue from "@/ui/Dialogue";
import Inanimate from "@/inanimates/Inanimate";
import Spell from "@/combat/Spell";
import StateManager from "@/state/StateManager";
import Stats from "@/Stats";
import Vector from "@common/Vector";
import Weapon from "@/combat/Weapon";
import actors from "./actors.json";
import config from "@/config";
import { Drawable, Lockable } from "@/interfaces";
import { RenderData } from "@/Renderable";
import { getImagePath } from "@/util";

/**
 * Collision information with another entity
 *
 * @type {Collision}
 */
type Collision = {
  position: Vector;
  size: Vector;
};

/**
 * A general purpose entity that interacts with fixtures in the game
 *
 * @type {Entity}
 */
type Entity = Actor | Inanimate;

/**
 * Actor is the base class for entities that affect change within the game
 */
abstract class Actor implements Drawable, Lockable {
  /**
   * The position the actor was previously at. This becomes handy if the actor
   * has a collision and needs to take a step back.
   *
   * @prop {Vector} lastPosition
   */
  private lastPosition: Vector;

  /**
   * Long-term saved position of the actor, in case we need to restore the
   * position after some period of time.
   *
   * @prop {Vector} savedPosition
   */
  private savedPosition: Vector;

  /**
   * Long-term saved direction of the actor, in case we need to restore the
   * direction the actor was facing after some period of time.
   *
   * @prop {number} savedDirection
   */
  private savedDirection: number;

  /**
   * Size of the actor
   *
   * @prop {Vector} _size
   */
  private _size: Vector;

  /**
   * Unique identifier
   *
   * @prop {string} id
   */
  protected id: string;

  /**
   * Level-related info about the actor
   *
   * @prop {object} data
   */
  protected data: any;

  /**
   * Game-related info about the actor
   *
   * @prop {object} config
   */
  protected config: any;

  /**
   * Dialogue that the actor is the leader of
   *
   * @prop {Dialogue} dialogue
   */
  protected dialogue: Dialogue = null;

  /**
   * If the actor is locked from updating
   *
   * @prop {boolean} locked
   */
  protected locked: boolean;

  /**
   * Current position of the actor
   *
   * @prop {Vector} _position
   */
  public position: Vector;

  /**
   * An actor's stats
   *
   * @prop {Stats} stats
   */
  public stats: Stats;

  /**
   * The weapon currently equipped to the actor
   *
   * @prop {Weapon} weapon
   */
  public weapon: Weapon;

  /**
   * Direction the actor is currently facing
   * 1 = north; 2 = west; 3 = south; 4 = east;
   *
   * @prop {number} direction
   */
  public direction: number;

  /**
   * If the actor is in dialogue
   *
   * @prop {boolean} inDialogue
   */
  public inDialogue: boolean;

  /**
   * Create a new Actor-based instance
   *
   * @param {Vector} position Positon of the actor
   * @param {Vector} size     Size of the actor
   * @param {object} data     Additional info about the actor
   */
  constructor(position: Vector, size: Vector, data: any) {
    let actorType = this.constructor.name;

    if (!data?.name) {
      throw new Error(`Missing unique identifier for ${actorType}.`);
    }

    if (!data?.type) {
      throw new Error(`Missing "type" for ${actorType}.`);
    }

    this.data = data;
    this.config = actors[data.type];

    if (this.config.baseStats) {
      this.stats = new Stats(this.config.baseStats);
    }

    if (!this.config) {
      throw new Error(
        `Config data for ${actorType} is not defined in actors.json`
      );
    }

    if (data.properties) {
      this.assignCustomProperties(data.properties);
    }

    this.id = data.name;
    this.position = position.times(config.scale);
    this._size = size;
    this.direction = 0;
    this.inDialogue = false;
    this.locked = false;
    this.lastPosition = this.position.copy();
    this.savedPosition = this.position.copy();
    this.savedDirection = this.direction;
  }

  /**
   * Get the actor's size
   *
   * @prop {Vector} size
   */
  get size(): Vector {
    return this._size;
  }

  /**
   * Get the name used when rendering dialogue
   *
   * @prop {string} displayAs
   */
  get displayAs(): string {
    return this.config.displayAs;
  }

  /**
   * Get the move set of an actor
   *
   * @return {any[]}
   */
  get moveSet(): any[] {
    return this.config.moveSet ?? [];
  }

  /**
   * Get the spells the actor currently knows
   *
   * @return {Spell[]} List of spells
   */
  get spells(): Spell[] {
    return this.moveSet
      .filter((move) => move.level <= this.stats.lvl)
      .map((spell) => new Spell(spell));
  }

  /**
   * Update the actor
   *
   * @param {number} dt Delta time
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
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
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
   * @param {Vector} position Position to move to
   */
  public moveTo(position: Vector) {
    this.position = position.copy();
  }

  /**
   * Lock the menu
   *
   * @return {boolean} If unlock was successful
   */
  public lock(): boolean {
    this.locked = true;

    return true;
  }

  /**
   * Unlock the menu
   *
   * @return {boolean} If unlock was successful
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
   * Backstep the actor. If a collision happens, try backstepping in only one
   * direction. Otherwise, just revert to the last position.
   *
   * @param {Collision} collision Collision to consider
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
   * Determine if the actor collides with another entity. Check if the actor's
   * collision point is inside of the entity
   *
   * @param  {Entity} entity     Entity to check collision with
   *
   * @return {Collision | false} Collision indicator
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
   */
  public savePosition() {
    this.savedPosition = this.position.copy();
    this.savedDirection = this.direction;
  }

  /**
   * Restore the actor's saved position
   *
   * @param {boolean} unlock If the actor should be unlocked too
   */
  public restorePosition(unlock: boolean = true) {
    this.moveTo(this.savedPosition);
    this.direction = this.savedDirection;

    if (unlock) {
      this.unlock();
    }
  }

  /**
   * Allow the actor to attack another actor. Allow the weapon to be specified,
   * and fall back to the actor's weapon when it's not.
   *
   * @param {Actor}  target Other actor to attack
   * @param {Weapon} weapon Weapon to use for attack
   */
  public attack(target: Actor, weapon?: Weapon) {
    if (!weapon && this.weapon) {
      weapon = this.weapon;
    }

    let weaponDamage = weapon?.damage ?? 0;
    let damage = this.stats.atk + weaponDamage;

    target.endure(damage);
  }

  /**
   * Receive an amount of damage
   *
   * @param {number} damage Amount of damage to receive
   */
  public endure(damage: number) {
    this.stats.endure(damage);
  }

  /**
   * Resolve the current state of the actor in comparison to the game state
   *
   * TODO: Tie the ref to the actor better, it's currently a little loosey goosey
   *
   * @param  {string} ref Reference to where in the state the actor is stored
   *
   * @return {object}     Actor data as stored in the state
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

    return stateManagerData;
  }

  /**
   * Get render info from an actor's config
   *
   * @return {RenderData} Inputs for a renderable
   */
  protected getUiInfo(): RenderData {
    const UI = this.config.ui;

    return {
      fps: UI.fps,
      ratio: new Vector(UI.frames.x, UI.frames.y),
      scale: UI.scale * config.scale,
      sprite: getImagePath(UI.sprite),
    };
  }

  /**
   * Get current state of the actor for export to a state manager
   *
   * @return {object} Current state of the actor
   */
  protected getState(): object {
    return { type: this.data.type, dmg: this.stats.dmg, lvl: this.stats.lvl };
  }

  /**
   * Retrieve a coordinate within the area of the actor to consider as a
   * collision point.
   *
   * TODO: Reconsider the hardcoded values here
   *
   * @param {boolean} prev Use previous position instead of current position
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
   * @param {object[]} props List of properties
   */
  private assignCustomProperties(props: any[]) {
    let lvl = props.filter((prop) => prop.name === "lvl")[0]?.value;

    if (lvl && this.stats) {
      this.stats.lvl = +lvl;
    }
  }

  /**
   * Force some sort of render when debug mode is on.
   *
   * @param {CanvasRenderingContext2D} ctx         Render context
   * @param {Vector}                   offset      Render position offset
   * @param {Vector}                   _resolution Render resolution
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
