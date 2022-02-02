/**
 * A simple 2D vector
 *
 * Common use cases include cartesian coordinates, and screen resolution.
 */
class Vector {
  /**
   * Create a new vector instance
   *
   * @param x - x-coordinate
   * @param y - y-coordinate
   */
  constructor(public x: number, public y: number) {}

  /**
   * Create a copy of this vector
   *
   * @return - the copied vector
   */
  public copy(): Vector {
    return new Vector(this.x, this.y);
  }

  /**
   * Add to vector to generate a new vector
   *
   * @param addend - value to add
   *
   * @return new vector
   */
  public plus(addend: Vector): Vector {
    return new Vector(this.x + addend.x, this.y + addend.y);
  }

  /**
   * Subtract a vector to generate a new vector
   *
   * @param subtrahend - value to subtract
   *
   * @return new vector
   */
  public minus(subtrahend: Vector): Vector {
    return new Vector(this.x - subtrahend.x, this.y - subtrahend.y);
  }

  /**
   * Multiply by a factor to generate a new vector
   *
   * @param factor - factor to multiply by
   *
   * @return new Vector
   */
  public times(factor: Vector | number): Vector {
    if (typeof factor === "number") {
      return new Vector(this.x * factor, this.y * factor);
    }

    return new Vector(this.x * factor.x, this.y * factor.y);
  }

  /**
   * Convert to an array
   *
   * @return resulting array
   */
  public toArray(): [number, number] {
    return [this.x, this.y];
  }

  /**
   * Return a new vector run thorugh a callback
   *
   * @param callback - callback to apply
   *
   * @return resulting vector
   */
  public apply(callback: (scalar: number) => number): Vector {
    return new Vector(callback(this.x), callback(this.y));
  }
}

export default Vector;
