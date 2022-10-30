import * as ex from "excalibur";
import MissingDataError from "../error/MissingDataError";
import { Constructor } from "../mixins";
import { Nullable } from "../types";
export const Movable = <T extends Constructor>(Base: T) =>
  /** A class that has a position and can be moved */
  class Movable extends Base {
    /** Position of the entity */
    // TODO: this relies on excalibur pos but it's typed locally as any

    /** Saved postion */
    private _saved_position: Nullable<ex.Vector> = null;

    get position() {
      if (!this.pos) {
        throw new MissingDataError(
          "Failed to locate position on Movable instance"
        );
      }

      return this.pos.clone() as ex.Vector;
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
    public savePosition() {
      this._saved_position = this.pos.clone();
      this._direction;
    }

    /** Restore the position of the entity*/
    public restorePosition() {
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

export const Resizable = <T extends Constructor>(Base: T) =>
  /** A class that has a size and can be resized */
  class Resizable extends Base {
    get size() {
      if (!this.width || !this.height) {
        throw new MissingDataError(
          "Failed to locate size on Resizable instance"
        );
      }

      return new ex.Vector(this.width, this.height);
    }
  };
