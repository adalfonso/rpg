/**
 * This is a simple 2D vector. Common use cases include cartesian coordinates,
 * and screen resolution.
 */
class Vector {
  /**
   * Create a new vector instance
   *
   * @param {number} x x-coordinate
   * @param {number} y y-coordinate
   */
  constructor(public x: number, public y: number) {}

  /**
   * Create a copy of this vector
   *
   * @return {Vector} The copied vector
   */
  copy(): Vector {
    return new Vector(this.x, this.y);
  }

  /**
   * Add to vector to generate a new vector
   *
   * @param  {Vector} addend Value to add
   *
   * @return {Vector}   New vector
   */
  plus(addend: Vector): Vector {
    return new Vector(this.x + addend.x, this.y + addend.y);
  }

  /**
   * Multiply by a factor to generate a new vector
   *
   * @param  {Vecetor | number} factor Factor to multiply by
   *
   * @return {Vector}                  New Vector
   */
  times(factor: Vector | number): Vector {
    if (typeof factor === "number") {
      return new Vector(this.x * factor, this.y * factor);
    }

    return new Vector(this.x * factor.x, this.y * factor.y);
  }

  /**
   * Convert to an array
   *
   * @return {[number, number]} Resulting array
   */
  toArray(): [number, number] {
    return [this.x, this.y];
  }
}

export default Vector;
