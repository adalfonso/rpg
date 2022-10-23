import * as ex from "excalibur";
import MissingDataError from "@/error/MissingDataError";
import Weapon from "@/combat/strategy/Weapon";
import { Actor } from "./Actor";
import { Direction } from "@/ui/types";
import { Nullable } from "@/types";
import { Pet } from "./Pet";
import { PlayerState } from "@schema/actor/PlayerSchema";
import { Stateful } from "@/interfaces";
import { TiledTemplate } from "./types";
import { bus, EventType } from "@/event/EventBus";

interface PlayerArgs {
  template: TiledTemplate;
  args: ex.ActorArgs;
  speed: number;
}

/** The main entity of the game */
export class Player extends Actor implements Stateful<PlayerState> {
  /** The speed the player will move in any one direction */
  private _speed: number;

  /** Pet owned by the player */
  private _pet: Nullable<Pet> = null;

  /**
   * Create a new Player instance
   *
   * @param args - the player's config
   * @param game - game engine instance
   */
  constructor(args: PlayerArgs, game: ex.Engine) {
    super(args.template, args.args);
    this._speed = args.speed;

    this._registerControls(game);
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
  public update(_game: ex.Engine, dt: number) {
    if (this.locked) {
      return;
    }

    if (this._pet) {
      this._pet.follow({
        position: this.pos,
        direction: this.direction,
        dt,
      });

      this._pet.update(dt);
    }
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
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

        "equipment.unequip": (e: CustomEvent) => {
          const { equipment } = e.detail;

          if (this.weapon !== equipment) {
            return;
          }

          if (!equipment) {
            throw new MissingDataError(
              `Player unable to unequip equipment because it is missing.`
            );
          }

          this.unequip();
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
  }

  /**
   * Kill off the player
   *
   * @param record - if this should be recorded to the state
   */
  public kill(record = true) {
    this._defeated = true;

    if (record) {
      bus.emit("team.save", { actor: this });
    }
  }

  /**
   * Equip a weapon
   *
   * @param weapon - weapon to equip
   * @param record - if this should be recorded to the state
   */
  protected equip(weapon: Weapon, record = true) {
    if (weapon === this.weapon) {
      return;
    }

    super.equip(weapon);

    if (record) {
      bus.emit("team.save", { actor: this });
    }
  }

  /** Register main keyboard controls */
  private _registerControls(game: ex.Engine) {
    game.input.keyboard.on("press", this._move.bind(this));
    game.input.keyboard.on("release", this._stopMove.bind(this));
  }

  /**
   * Change the graphic to match the direction the player is facing
   *
   * @param direction - cardinal direction to face
   */
  private _changeDirection = (direction: Direction) => {
    this.graphics.use(this.sprites[direction]);
  };

  /**
   * Move the player in a direction based on the key pressed
   *
   * @param event - keypress event
   */
  private _move(event: ex.Input.KeyEvent) {
    if (this.locked) {
      return;
    }

    const { key } = event;

    if (key === "ArrowUp") {
      this.vel.y = -this._speed;
      this._changeDirection(Direction.North);
    } else if (key === "ArrowRight") {
      this.vel.x = this._speed;
      this._changeDirection(Direction.East);
    } else if (key === "ArrowDown") {
      this.vel.y = this._speed;
      this._changeDirection(Direction.South);
    } else if (key === "ArrowLeft") {
      this.vel.x = -this._speed;
      this._changeDirection(Direction.West);
    }
  }

  /**
   * Stop moving the player in a direction based on the key released
   *
   * @param event - keyrelease event
   */
  private _stopMove(evt: ex.Input.KeyEvent) {
    if (this.locked) {
      return;
    }

    const { key } = evt;

    if (key === "ArrowUp" && this.vel.y < 0) {
      this.vel.y = 0;
    } else if (key === "ArrowRight" && this.vel.x > 0) {
      this.vel.x = 0;
    } else if (key === "ArrowDown" && this.vel.y > 0) {
      this.vel.y = 0;
    } else if (key === "ArrowLeft" && this.vel.x < 0) {
      this.vel.x = 0;
    }
  }
}
