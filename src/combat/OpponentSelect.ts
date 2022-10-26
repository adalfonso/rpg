import Team from "./Team";
import { Actor } from "@/actor/Actor";
import { Drawable, Lockable } from "@/interfaces";
import { Vector } from "excalibur";
import { bus, EventType } from "@/event/EventBus";

/**
 * A tool to select which opponent to attack
 *
 * This class allows members of a team to be traversed and targeted for combat.
 * It draws an arrow above their sprite as an indicator.
 */
class OpponentSelect implements Drawable, Lockable {
  /** Currently selected index of the opponents */
  private _index = 0;

  /** If this selection is locked from changing */
  private _locked = true;

  /**
   * Create a new OpponentSelect instance
   *
   * @param _opponents - opponent team members
   */
  constructor(private _opponents: Team<Actor>) {
    bus.register(this);
  }

  /** Get the locked state of the selection */
  get isLocked(): boolean {
    return this._locked;
  }

  /** Get the currently selected opponent */
  get selected(): Actor {
    return this._opponents.all()[this._index];
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Keyboard]: {
        keyup: (e: KeyboardEvent) => {
          if (this._locked) {
            return;
          }

          switch (e.key) {
            case "ArrowRight":
              return this._next();

            case "ArrowLeft":
              return this._previous();
          }
        },
      },
    };
  }

  /**
   * Draw opponent select arrow
   *
   * @param ctx         - render context
   * @param _resolution - render resolution
   */
  public draw(ctx: CanvasRenderingContext2D, _resolution: Vector) {
    if (this._opponents.areDefeated) {
      return;
    }

    const fontOffset = new Vector(17, -36);
    const position = this.selected.position.add(fontOffset);

    ctx.save();

    ctx.translate(position.x, position.y);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.font = "42px Minecraftia";
    ctx.fillStyle = "#0DD";
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "#333";
    ctx.fillText("➧", 0, 0);

    ctx.restore();
  }

  /**
   * Lock the selection
   *
   * @return if the lock succeeded
   */
  public lock(): boolean {
    this._locked = true;
    return true;
  }

  /**
   * Unlock the selection
   *
   * @return if the unlock succeeded
   */
  public unlock(): boolean {
    this._locked = false;
    return true;
  }

  /** Select the first non-defeated enemy */
  public resolveSelected() {
    const opponents = this._opponents.all();

    for (let i = 0; i < opponents.length; i++) {
      if (!opponents[i].isDefeated) {
        this._index = i;
        return;
      }
    }
  }

  /** Switch to the next selection */
  private _next() {
    if (this._opponents.areDefeated) {
      return;
    }

    if (this._opponents.hasLastManStanding()) {
      return this.resolveSelected();
    }

    if (this._index === this._opponents.length - 1) {
      this._index = 0;
    } else {
      this._index++;
    }

    if (this.selected.isDefeated) {
      this._next();
    }
  }

  /** Switch to the previous selection */
  private _previous() {
    if (this._opponents.areDefeated) {
      return;
    }

    if (this._opponents.hasLastManStanding()) {
      return this.resolveSelected();
    }

    if (this._index === 0) {
      this._index = this._opponents.length - 1;
    } else {
      this._index--;
    }

    if (this.selected.isDefeated) {
      this._previous();
    }
  }
}

export default OpponentSelect;
