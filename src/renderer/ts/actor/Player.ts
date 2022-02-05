import Actor from "./Actor";
import MissingDataError from "@/error/MissingDataError";
import Renderable from "@/ui/Renderable";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import Weapon from "@/combat/strategy/Weapon";
import config from "@/config";
import { Drawable, Eventful, Lockable, CallableMap } from "@/interfaces";
import { LevelFixtureTemplate } from "@/level/LevelFixture";
import { bus } from "@/EventBus";

/** The main entity of the game */
class Player extends Actor implements Eventful, Drawable, Lockable {
  /** The speed the player will move in any one direction */
  private baseSpeed: number;

  /** The current speed of the player in x/y directions */
  private speed: Vector;

  /** Each sprite of the player's movement animation */
  private sprites: Renderable[];

  /**
   * Create a new Player instance
   *
   * @param _position - the player's position
   * @param _size - the player's size
   * @param template - the player's data template
   */
  constructor(
    _position: Vector,
    _size: Vector,
    template: LevelFixtureTemplate
  ) {
    super(_position, _size, template);

    this.speed = new Vector(0, 0);
    this.baseSpeed = _size.x / 10;

    const { fps, frames, ratio, scale, sprite } = this.getUiInfo();

    // This assumes that each direction has its own row and is in NESW order
    const start = {
      north: 0 * frames.x,
      east: 1 * frames.x,
      south: 2 * frames.x,
      west: 3 * frames.x,
    };

    this.sprites = [
      // img, scale, startFrame, frameCount, framesX, framesY, speed
      new Renderable(sprite, scale, start.south, frames.idle, ratio, fps),
      new Renderable(sprite, scale, start.north, frames.north, ratio, fps),
      new Renderable(sprite, scale, start.east, frames.east, ratio, fps),
      new Renderable(sprite, scale, start.south, frames.south, ratio, fps),
      new Renderable(sprite, scale, start.west, frames.west, ratio, fps),
    ];

    this.resolveState(template.type);

    bus.register(this);
  }

  /**
   * Update the player
   *
   * @param dt - delta time
   *
   * @emits player.move
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

    const distance = this.speed.times(config.scale).times(speedModifier);

    this.moveTo(this._position.plus(distance));

    if (Math.abs(this.speed.x) + Math.abs(this.speed.y)) {
      bus.emit("player.move", { player: this });
    }
  }

  /**
   * Draw Player and all underlying entities
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
    super.draw(ctx, offset, resolution);

    this.sprites[this.direction].draw(ctx, this._position.plus(offset));
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
    return {
      keydown: (e: KeyboardEvent) => {
        if (e.key.match(/Arrow/)) {
          this.changeSpeed(e.key);
        }
      },

      keyup: (e: KeyboardEvent) => {
        if (e.key.match(/Arrow/)) {
          this.stop(e.key);
        }
      },

      "equipment.equip": (e: CustomEvent) => {
        const equipment = e.detail.equipment;

        if (!equipment) {
          throw new MissingDataError(
            `Player unable to equip equipment because it is missing.`
          );
        }

        if (equipment instanceof Weapon) {
          this.equip(equipment);
        }
      },
    };
  }

  /**
   * Gain experience points
   *
   * @param exp - number of experience points to gain
   *
   * @emits actor.gainExp
   */
  public gainExp(exp: number) {
    const expData = this.stats.gainExp(exp);

    const data = {
      abilities: this._getAllAbilities(),
      ...expData,
    };

    bus.emit("actor.gainExp", data);

    StateManager.getInstance().mergeByRef("player", this.getState());
  }

  /**
   * Kill off the player
   */
  public kill() {
    this._defeated = true;

    StateManager.getInstance().mergeByRef(`player.defeated`, true);
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

    super.equip(weapon);

    StateManager.getInstance().mergeByRef("player", this.getState());
  }

  /**
   * Change the player's speed
   *
   * @param key - the key that has been pressed
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
   * @param key - the key that has been released
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
   *
   * Since the canvas renders in quadrant IV, moving away from the origin in the
   * y-direction is an increase in the negative y, but an increase in
   * position-y. Because of this inversion, north is speed < 0 and south is
   * speed > 0.
   */
  private changeDirection() {
    if (this.locked) {
      return;
    }

    if (this.speed.x > 0) {
      // east
      this.direction = 2;
    } else if (this.speed.x < 0) {
      // west
      this.direction = 4;
    } else if (this.speed.y > 0) {
      // south
      this.direction = 3;
    } else if (this.speed.y < 0) {
      // north
      this.direction = 1;
    }
    // else {
    //   // idle
    //   this.direction = 0;
    // }
  }

  /**
   * Get current state of the player for export to a state manager
   *
   * @return current state of the player
   */
  protected getState(): Record<string, unknown> {
    return {
      ...super.getState(),
      exp: this.stats.exp,
      equipped: this.weapon?.type ?? null,
    };
  }
}

export default Player;
