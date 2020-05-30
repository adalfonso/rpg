import Vector from "@common/Vector";

/**
 * A translation from one point to another
 */
class Translation {
  /**
   * Time elapsed since the animation started
   */
  private _timeElapsed: number = 0;

  /**
   * If the translation has finished
   */
  private _isDone: boolean = false;

  /**
   * Create a new Translation instance
   *
   * @param _a        - starting coordinate
   * @param _b        - ending coordinate
   * @param _duration - duration of translation
   */
  constructor(
    private _a: Vector,
    private _b: Vector,
    private _duration: number
  ) {}

  /**
   * Determine if the translation is done
   */
  get isDone(): boolean {
    return this._isDone;
  }

  /**
   * Update the translation
   *
   * @param dt - delta time
   *
   * @return current position of the translation
   */
  public update(dt: number): Vector {
    if (this._isDone) {
      return this._b.copy();
    }

    this._timeElapsed += dt;

    if (this._timeElapsed > this._duration) {
      this._isDone = true;
      return this._b.copy();
    }

    let percentComplete = Math.min(1, this._timeElapsed / this._duration);

    const a = this._a;
    const b = this._b;

    return a.minus(a.minus(b).times(percentComplete));
  }
}

export default Translation;
