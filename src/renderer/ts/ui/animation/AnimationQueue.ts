import AnimatedText from "./AnimatedText";
import Translation from "./Translation";
import Vector from "@common/Vector";

/**
 * AnimationQueue queues up a sequence of animations and applies them to a
 * target entity.
 */
class AnimationQueue {
  /**
   * If all animations have finished
   *
   * @prop {boolean} _isDone
   */
  private _isDone: boolean = false;

  /**
   * Create a new AnimationQueue instance
   *
   * @param {Translation[]} queue  Queue of animations to run
   * @param {AnimatedText}  target Target entity for the animations
   */
  constructor(private _queue: Translation[], private _target: AnimatedText) {
    this._target.applyAnimation(this._queue[0]);
  }

  /**
   * Determine if all animations have finished
   *
   * @return {boolean} If all animations have finished
   */
  get isDone(): boolean {
    return this._isDone;
  }

  /**
   * Update the animation
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {
    if (this._isDone) {
      return;
    }

    if (this._target.isWaiting) {
      this._queue.shift();

      if (!this._queue.length) {
        this._isDone = true;
        return;
      }

      this._target.applyAnimation(this._queue[0]);
    }

    this._target.update(dt);
  }

  /**
   * Hand off drawing to the target
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    this._target.draw(ctx, offset, resolution);
  }
}

export default AnimationQueue;
