import MissingDataError from "../error/MissingDataError";
import { Constructor } from "../mixins";
import { Nullable } from "../types";
import { Vector } from "excalibur";

export const Movable = <T extends Constructor>(Base: T) =>
  /** A class that has a position and can be moved */
  class Movable extends Base {
    /** Position of the entity */
    protected _position: Nullable<Vector> = null;

    get position() {
      if (!this._position) {
        throw new MissingDataError(
          "Failed to locate position on Movable instance"
        );
      }

      return this._position;
    }

    /**
     * Helper method to change the actor's position
     *
     * @param position - position to move to
     */
    public moveTo(position: Vector) {
      this._position = position.clone();
    }
  };

export const Resizable = <T extends Constructor>(Base: T) =>
  /** A class that has a size and can be resized */
  class Resizable extends Base {
    /** Size of the entity */
    protected _size: Nullable<Vector> = null;

    get size() {
      if (!this._size) {
        throw new MissingDataError(
          "Failed to locate size on Resizable instance"
        );
      }

      return this._size;
    }
  };
