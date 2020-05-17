import Actor from "./Actor";
import InvalidDataError from "@/error/InvalidDataError";
import MissingDataError from "@/error/MissingDataError";
import Renderable from "@/Renderable";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import Weapon from "@/combat/Weapon";
import config from "@/config";
import { Drawable, Eventful, Lockable } from "@/interfaces";
import { bus } from "@/EventBus";

/**
 * A Player is the main entity of the game.
 */
class Player extends Actor implements Eventful, Drawable, Lockable {
  /**
   * The speed the player will move in any one direction
   *
   * @prop {number} baseSpeed
   */
  private baseSpeed: number;

  /**
   * The current speed of the player in x/y directions
   *
   * @prop {Vector} speed
   */
  private speed: Vector;

  /**
   * An array of renderables for each sprite of the players movement animation
   *
   * @prop {Renderable[]} sprites
   */
  private sprites: Renderable[];

  /**
   * Create a new Player instance
   *
   * @param {Vector} position  The player's position
   * @param {Vector} size      The player's size
   */
  constructor(position: Vector, size: Vector) {
    super(position, size, { name: "Me", type: "player" });

    this.speed = new Vector(0, 0);
    this.baseSpeed = size.x / 10;

    let { fps, ratio, scale, sprite } = this.getUiInfo();

    this.sprites = [
      // Keep this example of an animated sprite until we actually use one
      // img, scale, startFrame, frameCount, framesX, framesY, speed
      // new Renderable(sprite, 1, 18, 0, 9, 4, 8),
      // new Renderable(sprite, 1, 1, 7, 9, 4, 8),
      // new Renderable(sprite, 1, 9, 7, 9, 4, 8),
      // new Renderable(sprite, 1, 19, 7, 9, 4, 8),
      // new Renderable(sprite, 1, 27, 7, 9, 4, 8)
      new Renderable(sprite, scale, 0, 0, ratio, fps),
      new Renderable(sprite, scale, 3, 0, ratio, fps),
      new Renderable(sprite, scale, 2, 0, ratio, fps),
      new Renderable(sprite, scale, 0, 0, ratio, fps),
      new Renderable(sprite, scale, 1, 0, ratio, fps),
    ];

    this.resolveState(this.data.type);

    bus.register(this);
  }

  /**
   * Update the player
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {
    if (this.locked) {
      return;
    }

    super.update(dt);

    let speedModifier = 0.4;

    // Reduce speed when traveling diagonally
    if (this.speed.x * this.speed.y !== 0) {
      speedModifier *= 0.75;
    }

    let distance = this.speed.times(config.scale).times(speedModifier);
    let position = this.position.plus(distance);

    this.moveTo(position);

    if (Math.abs(this.speed.x) + Math.abs(this.speed.y)) {
      bus.emit("player.move", { player: this });
    }
  }

  /**
   * Draw Player and all underlying entities
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
    super.draw(ctx, offset, resolution);

    this.sprites[this.direction].draw(ctx, this.position.plus(offset));
  }

  /**
   * Register events with the event bus
   *
   * @return {object} Events to register
   */
  public register(): object {
    return {
      keydown: (e) => {
        if (e.key.match(/Arrow/)) {
          this.changeSpeed(e.key);
        }
      },

      keyup: (e) => {
        if (e.key.match(/Arrow/)) {
          this.stop(e.key);
        }
      },

      "weapon.equip": (e) => {
        let weapon = e.detail.weapon;

        if (!weapon) {
          throw new MissingDataError(
            `Player unable to equip weapon because it is missing.`
          );
        }

        if (!(weapon instanceof Weapon)) {
          throw new InvalidDataError(`Player unable to equip a non-weapon.`);
        }

        this.weapon = weapon;
      },
    };
  }

  /**
   * Gain experience points
   *
   * @param {number} exp Number of experience points to gain
   */
  public gainExp(exp: number) {
    let expData = this.stats.gainExp(exp);

    let data = {
      moveSet: this.moveSet,
      ...expData,
    };

    bus.emit("actor.gainExp", data);

    StateManager.getInstance().mergeByRef("player", this.getState());
  }

  /**
   * Change the player's speed
   *
   * @param {string} key The key that has been pressed
   */
  private changeSpeed(key: string) {
    switch (key) {
      case "ArrowLeft":
        this.speed.x = -this.baseSpeed;
        break;

      case "ArrowDown":
        this.speed.y = this.baseSpeed;
        break;

      case "ArrowRight":
        this.speed.x = this.baseSpeed;
        break;

      case "ArrowUp":
        this.speed.y = -this.baseSpeed;
        break;
    }

    this.changeDirection();
  }

  /**
   * Stop the player from moving
   *
   * @param {string} key The key that has been released
   */
  private stop(key: string) {
    if (key === "ArrowLeft" && this.speed.x < 0) {
      this.speed.x = 0;
    }

    if (key === "ArrowRight" && this.speed.x > 0) {
      this.speed.x = 0;
    }

    if (key === "ArrowUp" && this.speed.y < 0) {
      this.speed.y = 0;
    }

    if (key === "ArrowDown" && this.speed.y > 0) {
      this.speed.y = 0;
    }

    this.changeDirection();
  }

  /**
   * Change the direction the player is facing based on their speed
   */
  private changeDirection() {
    if (this.locked) {
      return;
    }

    if (this.speed.x > 0) {
      this.direction = 4;
    } else if (this.speed.x < 0) {
      this.direction = 2;
    } else if (this.speed.y > 0) {
      this.direction = 3;
    } else if (this.speed.y < 0) {
      this.direction = 1;
    }
  }

  /**
   * Get current state of the player for export to a state manager
   *
   * @return {object} Current state of the player
   */
  protected getState(): object {
    return { ...super.getState(), exp: this.stats.exp };
  }
}

export default Player;
