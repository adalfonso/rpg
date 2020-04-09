export default class Vector {
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
   * Multiply by a factor to generate a new vector
   *
   * @param {number} factor Factor to multiply by
   */
  times(factor: number): Vector {
    return new Vector(this.x * factor, this.y * factor);
  }
}
