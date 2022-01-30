import Vector from "@common/Vector";
import { AnimationFunctionApplication } from "./AnimationFunction";

/** Describes one step of an animation */
export interface AnimationStepTemplate {
  delay_ms: number;
  duration_ms: number;
  end: (subject?: Vector, resolution?: Vector) => Vector;
  fn: AnimationFunctionApplication;
}

/**
 * Entities related to the animation
 *
 * This reference contains entities used to calculate the end of an animation.
 * e.g. for a translation, the entity's position would be relevant to the
 * calculation. This is pretty open-ended to allow freedom with how the end of
 * an animation step gets calculated. This is because there are various
 * categories an animation falls into (position, size, rotation, etc.)
 *
 * These references may not be necessary if the calculation is static, e.g.
 * move an entity 2 units left, or double the size of an entity.
 **/
export interface EntityReference {
  // Subject's size, position, etc., that's needed to calculate the animation end
  subject?: Vector;

  // Resolution of the canvas used when calculating an animation end
  resolution?: Vector;
}

/**
 * Used to facilitate an animation as a function of time
 *
 * As a function of time, animations employ an update method that is fed the
 * delta time between animation updates. The update method will report back on
 * with updates of the animation data to be consumed by other parts of the
 * program.
 **/
export class AnimationStep {
  /**
   * If the animation is locked
   *
   * This gets set on the final animation update.
   */
  private _locked = false;

  /** Current time relative to the start of the animation */
  private _current_time: number = 0;

  /**
   * Create a new animation instance
   *
   * @param _template - animation template
   * @param _reference - references to related entities
   */
  constructor(
    private _template: AnimationStepTemplate,
    private _reference: EntityReference
  ) {}

  /** Refresh/reset the step to its original state */
  public refresh() {
    this._current_time = 0;
    this._locked = false;
  }

  /** Public view into if the animation has completed */
  public get isDone(): boolean {
    return this._hasCompleted() && this._locked;
  }

  /**
   * If the animation has "technically" completed
   *
   * This is relied on internally to determine when the animation has reached
   * its final update. Once that has happened, this method is used in
   * conjunction with _locked to inform the outside world that the animation is
   * done.
   **/
  private _hasCompleted(): boolean {
    const { duration_ms, delay_ms } = this._template;
    return this._current_time >= duration_ms + delay_ms;
  }

  /**
   * Update the animation by delta time
   *
   * @param dt - delta time
   *
   * @return animation's delta update
   */
  public update(dt: number): Vector {
    const { duration_ms, delay_ms, end, fn } = this._template;
    const { subject, resolution } = this._reference;

    this._current_time += dt;

    if (this._current_time < delay_ms || this.isDone) {
      return new Vector(0, 0);
    }

    if (this._hasCompleted()) {
      this._locked = true;
    }

    const adj_duration_ms = Math.max(dt, duration_ms);
    const adj_time = this._current_time - delay_ms;
    const adj_dt = Math.min(adj_time, dt);

    const prev_percent = (adj_time - adj_dt) / adj_duration_ms;
    const current_percent = Math.min(1, adj_time / adj_duration_ms);
    const previous = fn(prev_percent, end(subject, resolution));
    const current = fn(current_percent, end(subject, resolution));

    return current.minus(previous);
  }
}
