import * as ex from "excalibur";
import { Constructor } from "../mixins";
import { Nullable } from "../types";

export class BaseMovable {
  public pos = ex.vec(0, 0);
}

export const Movable = <T extends Constructor<{ pos: ex.Vector }>>(Base: T) =>
  /** A class that has a position and can be moved */
  class Movable extends Base {
    /** Saved position */
    private _saved_position: Nullable<ex.Vector> = null;

    get position() {
      return this.pos.clone();
    }

    /**
     * Helper method to change the actor's position
     *
     * @param position - position to move to
     */
    public moveTo(position: ex.Vector) {
      this.pos = position.clone();
    }

    /* Save the position of the entity so it can be used later */
    protected _savePosition() {
      this._saved_position = this.pos.clone();
    }

    /** Restore the position of the entity */
    protected _restorePosition() {
      if (!this._saved_position) {
        console.warn(
          `Tried to restore position for Entity but saved position is null`
        );

        return;
      }

      this.pos = this._saved_position.clone();
      this._saved_position = null;
    }
  };

export const Resizable = <
  T extends Constructor<{ height: number; width: number }>
>(
  Base: T
) =>
  /** A class that has a size and can be resized */
  class Resizable extends Base {
    get size() {
      return new ex.Vector(this.width, this.height);
    }
  };
