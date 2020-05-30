import AnimatedText from "./AnimatedText";
import Translation from "./Translation";
import Vector from "@common/Vector";

/**
 * Queues up a sequence of animations and applies them to a target entity
 */
class AnimationQueue {
  /**
   * If all animations have finished
   */
  private _isDone: boolean = false;

  /**
   * Create a new AnimationQueue instance
   *
   * @param queue  - queue of animations to run
   * @param target - target entity for the animations
   */
  constructor(private _queue: Translation[], private _target: AnimatedText) {
    this._target.applyAnimation(this._queue[0]);
  }

  /**
   * Determine if all animations have finished
   */
  get isDone(): boolean {
    return this._isDone;
  }

  /**
   * Update the animation
   *
   * @param dt - delta time
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
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
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
