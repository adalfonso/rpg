import BaseActor from "./BaseActor";
import sprite from "../../img/player-new.png";
import Renderable from "../Renderable";
import Weapon from "../item/Weapon";
import Vector from "../Vector";
import Stats from "../Stats";
import { bus } from "../app";
import Eventful from "../Eventful";
import Drawable from "../Drawable";
import Lockable from "../Lockable";

class Player extends BaseActor implements Eventful, Drawable, Lockable {
  protected maxSpeed: number;
  protected speed: Vector;
  protected sprites: Renderable[];
  public spells: any[];
  public stats: Stats;
  public weapon: Weapon;

  constructor(pos: Vector, size: Vector) {
    super(pos, size);

    this.speed = new Vector(0, 0);
    this.maxSpeed = size.x / 10;

    this.sprites = [
      // img, scale, startFrame, frameCount, framesX, framesY, speed
      // new Renderable(sprite, 1, 18, 0, 9, 4, 8),
      // new Renderable(sprite, 1, 1, 7, 9, 4, 8),
      // new Renderable(sprite, 1, 9, 7, 9, 4, 8),
      // new Renderable(sprite, 1, 19, 7, 9, 4, 8),
      // new Renderable(sprite, 1, 27, 7, 9, 4, 8)
      new Renderable(sprite, 2, 0, 0, 1, 4, 8),
      new Renderable(sprite, 2, 3, 0, 1, 4, 8),
      new Renderable(sprite, 2, 2, 0, 1, 4, 8),
      new Renderable(sprite, 2, 0, 0, 1, 4, 8),
      new Renderable(sprite, 2, 1, 0, 1, 4, 8),
    ];

    this.stats = new Stats({
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

    // Testing
    this.init();
  }

  get name() {
    return "player";
  }

  get dialogueName() {
    return "Me";
  }

  update(dt: number) {
    if (this.locked) {
      return;
    }

    this.pos.x += this.speed.x;
    this.pos.y += this.speed.y;

    super.update(dt);
  }

  /**
   * Draw game and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  draw(ctx: CanvasRenderingContext2D, offset: Vector, resolution: Vector) {
    super.draw(ctx, offset, resolution);

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    this.sprites[this.direction].draw(ctx);

    ctx.restore();
  }

  move(key: string) {
    switch (key) {
      case "ArrowLeft":
        this.speed.x = -this.maxSpeed;
        break;

      case "ArrowDown":
        this.speed.y = this.maxSpeed;
        break;

      case "ArrowRight":
        this.speed.x = this.maxSpeed;
        break;

      case "ArrowUp":
        this.speed.y = -this.maxSpeed;
        break;
    }

    this.changeDirection();
  }

  stop(key: string) {
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

  changeDirection() {
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

  register(): object {
    return {
      keydown: (e) => {
        if (e.key.match(/Arrow/)) {
          this.move(e.key);
        }
      },

      keyup: (e) => {
        if (e.key.match(/Arrow/)) {
          this.stop(e.key);
        }
      },
    };
  }

  init() {
    this.weapon = new Weapon({
      name: "Basic Sword",
      description: "A basic bish sword.",
      damage: 1,
    });
  }
}

export default Player;
