import Actor from "./Actor";
import Renderable from "@/Renderable";
import StatsManager from "@/Stats";
import Vector from "@common/Vector";
import Weapon from "@/item/Weapon";
import { Drawable, Eventful, Lockable } from "@/interfaces";
import { bus } from "@/EventBus";
import { getImagePath } from "@src/ts/Util/loaders";

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
   * Spells that the player knows
   * TODO: Update this when spells are implemented
   *
   * @prop {any[]} spells
   */
  public spells: any[];

  /**
   * Create a new Player instance
   *
   * @param {Vector} position  The player's position
   * @param {Vector} size      The player's size
   */
  constructor(position: Vector, size: Vector) {
    super(position, size);

    this.speed = new Vector(0, 0);
    this.baseSpeed = size.x / 10;

    let sprite = getImagePath("characters.player");

    this.sprites = [
      // Keep this example of an animated sprite until we actually use one
      // img, scale, startFrame, frameCount, framesX, framesY, speed
      // new Renderable(sprite, 1, 18, 0, 9, 4, 8),
      // new Renderable(sprite, 1, 1, 7, 9, 4, 8),
      // new Renderable(sprite, 1, 9, 7, 9, 4, 8),
      // new Renderable(sprite, 1, 19, 7, 9, 4, 8),
      // new Renderable(sprite, 1, 27, 7, 9, 4, 8)
      new Renderable(sprite, 2, 0, 0, new Vector(1, 4), 8),
      new Renderable(sprite, 2, 3, 0, new Vector(1, 4), 8),
      new Renderable(sprite, 2, 2, 0, new Vector(1, 4), 8),
      new Renderable(sprite, 2, 0, 0, new Vector(1, 4), 8),
      new Renderable(sprite, 2, 1, 0, new Vector(1, 4), 8),
    ];

    // TODO: Hook this into a state loader instead of hardcoding
    this.stats = new StatsManager({
      hp: 10,
      atk: 2,
      def: 0,
      sp_atk: 0,
      sp_def: 0,
      spd: 1,
    });

    this.weapon = null;
    this.spells = [];

    bus.register(this);

    // For testing purposes only
    this.init();
  }

  /**
   * Get the name used when rendering dialogue
   *
   * @prop {string} dialogueName
   */
  get dialogueName() {
    return "Me";
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

    this.moveTo(this.position.plus(this.speed));

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

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    this.sprites[this.direction].draw(ctx);

    ctx.restore();
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
    };
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
   * Temporary function used for testing
   */
  private init() {
    this.weapon = new Weapon({
      name: "Basic Sword",
      description: "A basic bish sword.",
      damage: 1,
    });
  }
}

export default Player;
