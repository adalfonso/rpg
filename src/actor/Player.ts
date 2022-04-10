import Actor from "./Actor";
import MissingDataError from "@/error/MissingDataError";
import Vector from "@/physics/math/Vector";
import Weapon from "@/combat/strategy/Weapon";
import config from "@/config";
import { Direction } from "@/ui/types";
import { LevelFixtureTemplate } from "@/level/LevelFixture";
import { Nullable } from "@/types";
import { Pet } from "./Pet";
import { Stateful } from "@/interfaces";
import { bus, EventType } from "@/event/EventBus";
import { isPlayerState, PlayerState } from "@schema/actor/PlayerSchema";
import { state } from "@/state/StateManager";

/** The main entity of the game */
class Player extends Actor implements Stateful<PlayerState> {
  /** The speed the player will move in any one direction */
  private baseSpeed: number;

  /** The current speed of the player in x/y directions */
  private speed: Vector;

  /** Pet owned by the player */
  private _pet: Nullable<Pet> = null;

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

    this.speed = Vector.empty();
    this.baseSpeed = _size.x / 10;

    this._resolveState();

    bus.register(this);
  }

  /** Current data state */
  get state(): PlayerState {
    return {
      ...super.state,
      exp: this.stats.exp,
      equipped: this.weapon?.ref ?? null,
    };
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

    if (this._pet) {
      this._pet.follow({
        position: this._position,
        direction: this.direction,
        dt,
      });

      this._pet.update(dt);
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

    if (this._pet && !this.locked) {
      this._pet.draw(ctx, offset, resolution);
    }
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Keyboard]: {
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
      },
      [EventType.Custom]: {
        "equipment.equip": (e: CustomEvent) => {
          const { equipment, actor } = e.detail;

          if (actor !== this) {
            return;
          }

          if (!equipment) {
            throw new MissingDataError(
              `Player unable to equip equipment because it is missing.`
            );
          }

          if (equipment instanceof Weapon) {
            this.equip(equipment);
          }
        },
      },
    };
  }

  /**
   * Allow the player to own a pet
   *
   * @param pet - the pet being adopted
   * @throws when the player already owns a pet
   */
  public adoptPet(pet: Pet) {
    if (this._pet) {
      throw new Error(
        `Player ${this._template.name} can only have one pet at a time`
      );
    }

    this._pet = pet;
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
      actor: this,
      abilities: this._getAllAbilities(),
      ...expData,
    };

    bus.emit("actor.gainExp", data);

    state().mergeByRef("player", this.state);
  }

  /** Kill off the player */
  public kill() {
    this._defeated = true;

    state().mergeByRef(`player.defeated`, true);
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

    bus.emit("team.save");
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
      this.direction = Direction.East;
    } else if (this.speed.x < 0) {
      this.direction = Direction.West;
    } else if (this.speed.y > 0) {
      this.direction = Direction.South;
    } else if (this.speed.y < 0) {
      this.direction = Direction.North;
    }
  }

  /**
   * Resolve the current state of the player in comparison to the game state
   *
   * @return player data as stored in the state
   */
  protected _resolveState() {
    const data = super._resolveState<PlayerState>(isPlayerState);

    if (!isPlayerState(data)) {
      return state().mergeByRef(this.state_ref, this.state);
    }

    this.stats.exp = data.exp;

    // equipment handled through Inventory state resolution

    return data;
  }
}

export default Player;
