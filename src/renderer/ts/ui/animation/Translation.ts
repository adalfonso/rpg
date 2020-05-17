import Vector from "@common/Vector";

/**
 * Translation is a simply a translation from one point to another.
 */
class Translation {
  /**
   * Time elapsed since the animation started
   *
   * @prop {number} _timeElapsed
   */
  private _timeElapsed: number = 0;

  /**
   * If the translation has finished
   *
   * @prop {boolean} _isDone
   */
  private _isDone: boolean = false;

  /**
   * Create a new Translation instance
   *
   * @param {Vector} _a        Starting coordinate
   * @param {Vector} _b        Ending coordinate
   * @param {number} _duration Duration of translation
   */
  constructor(
    private _a: Vector,
    private _b: Vector,
    private _duration: number
  ) {}

  /**
   * Determine if the translation is done
   *
   * @return {boolean} If the translation is done
   */
  get isDone(): boolean {
    return this._isDone;
  }

  /**
   * Update the translation
   *
   * @param  {number} dt Delta time
   *
   * @return {Vector}    Current position of the translation
   */
  public update(dt: number): Vector {
    if (this._isDone) {
      return;
    }

    this._timeElapsed += dt;

    if (this._timeElapsed > this._duration) {
      this._isDone = true;
      return;
    }

    let percentComplete = Math.min(1, this._timeElapsed / this._duration);

    const a = this._a;
    const b = this._b;

    return a.minus(a.minus(b).times(percentComplete));
  }
}

export default Translation;
