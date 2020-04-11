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
   * @param  {number} x Scalar to add
   * @param  {number} y Scalar to add
   *
   * @return {Vector}   New vector
   */
  plus(x: number, y: number): Vector {
    return new Vector(this.x + x, this.y + y);
  }

  /**
   * Multiply by a factor to generate a new vector
   *
   * @param  {number} factor Factor to multiply by
   *
   * @return {Vector}        New Vector
   */
  times(factor: number): Vector {
    return new Vector(this.x * factor, this.y * factor);
  }
}

export default Vector;
