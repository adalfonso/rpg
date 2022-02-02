import Vector from "@common/Vector";
import { Constructor } from "./mixins";

/**
 * Generate a Movable mixin
 *
 * @param Base - base class
 */
export const Movable = <T extends Constructor>(Base: T) =>
  /** A class that has a position and can be moved */
  class Movable extends Base {
    /** Position of the entity */
    protected _position: Vector;

    get position(): Vector {
      return this._position;
    }

    /**
     * Helper method to change the actor's position
     *
     * @param position - position to move to
     */
    public moveTo(position: Vector) {
      this._position = position.copy();
    }
  };
