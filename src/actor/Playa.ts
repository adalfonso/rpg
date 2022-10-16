import * as ex from "excalibur";
import { Direction } from "@/ui/types";
import { KeyEvent } from "excalibur/build/dist/Input/Keyboard";

interface PlayaArgs {
  common: ex.ActorArgs;
  speed: number;
  sprites: Record<Direction, ex.Graphic>;
}

export class Playa extends ex.Actor {
  private _speed: number;
  private _sprites: Record<Direction, ex.Graphic>;

  constructor(args: PlayaArgs, private _game: ex.Engine) {
    super(args.common);
    this._speed = args.speed;
    this._sprites = args.sprites;

    this.graphics.use(this._sprites[Direction.South]);
    this._game.add(this);
    this._registerControls();
  }

  private _registerControls() {
    this._game.input.keyboard.on("press", this._move.bind(this));
    this._game.input.keyboard.on("release", this._stopMove.bind(this));
  }

  private _changeDirection = (direction: Direction) => {
    this.graphics.use(this._sprites[direction]);
  };

  private _move(evt: KeyEvent) {
    const { key } = evt;

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

  private _stopMove(evt: KeyEvent) {
    const { key } = evt;
    if (key === "ArrowUp" && this.vel.y < 0) {
      this.vel.y = 0;
    } else if (key === "ArrowRight" && this.vel.x > 0) {
      this.vel.x = 0;
    } else if (key === "ArrowDown" && this.vel.y < 0) {
      this.vel.y = 0;
    } else if (key === "ArrowLeft" && this.vel.x < 0) {
      this.vel.x = 0;
    }
  }
}
