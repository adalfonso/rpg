import Stats from "@/Stats";
import Vector from "@/Vector";
import Weapon from "@/item/Weapon";
import config from "@/config";
import { Drawable, Lockable } from "@/interfaces";

abstract class BaseActor implements Drawable, Lockable {
  protected lastPos: Vector;
  public locked: boolean;
  protected savedDirection: number;
  protected savedPos: Vector;
  private _size: Vector;
  protected stats: Stats;
  protected weapon: Weapon;
  public direction: number;
  public inDialogue: boolean;
  public pos: Vector;

  constructor(pos: Vector, size: Vector) {
    this.pos = pos.times(config.scale);
    this._size = size;
    this.direction = 0;
    this.inDialogue = false;
    this.locked = false;
    this.lastPos = pos.copy();
    this.savedPos = pos.copy();
    this.savedDirection = this.direction;
  }

  update(dt: number) {}

  /**
   * Draw game and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector) {
    if (config.debug) {
      this.debugDraw(ctx);
    }

    this.lastPos.x = this.pos.x;
    this.lastPos.y = this.pos.y;
  }

  get size(): Vector {
    return this._size;
  }

  debugDraw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#F99";
    ctx.fillRect(this.pos.x, this.pos.y, this._size.x, this._size.y);
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
    if (!this.inDialogue) {
      this.locked = false;

      return true;
    }

    return false;
  }

  // Positioning Methods

  backstep(collision?: { pos: Vector; size: Vector }) {
    let prevCollisionPoint = this.collisionPoint(true);

    if (collision) {
      if (
        prevCollisionPoint.x < collision.pos.x ||
        prevCollisionPoint.x > collision.pos.x + collision.size.x
      ) {
        this.pos.x = this.lastPos.x;
      } else {
        this.pos.y = this.lastPos.y;
      }
    } else {
      this.pos.x = this.lastPos.x;
      this.pos.y = this.lastPos.y;
    }
  }

  collidesWith(entity: any) {
    let collisionPoint = this.collisionPoint();

    let collision =
      collisionPoint.x > entity.pos.x &&
      collisionPoint.x < entity.pos.x + entity.size.x &&
      collisionPoint.y > entity.pos.y &&
      collisionPoint.y < entity.pos.y + entity.size.y;

    if (collision) {
      return {
        pos: entity.pos.copy(),
        size: entity.size.copy(),
      };
    }

    return false;
  }

  collisionPoint(prev: boolean = false): Vector {
    return new Vector(
      (prev ? this.lastPos.x : this.pos.x) + this._size.x * 0.5,
      (prev ? this.lastPos.y : this.pos.y) + this._size.y * 0.8
    );
  }

  savePos() {
    this.savedPos = this.pos.copy();
    this.savedDirection = this.direction;
  }

  restorePos(unlock: boolean = true) {
    this.pos = this.savedPos.copy();
    this.direction = this.savedDirection;

    if (unlock) {
      this.unlock();
    }
  }

  abstract get dialogueName();

  // Combat Methods

  attack(target: BaseActor, weapon?: Weapon) {
    if (!weapon && this.weapon) {
      weapon = this.weapon;
    }

    let weaponDamage = weapon && weapon.damage ? weapon.damage : 0;
    let damage = this.stats.atk + weaponDamage;

    target.endure(damage);
  }

  endure(damage: number) {
    this.stats.endure(damage);
  }
}

export default BaseActor;
