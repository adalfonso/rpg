import Vector from "@common/Vector";
import { AnimationStep } from "./AnimationStep";

/** Legal Animation types */
export enum AnimationType {
  Position,
}

/** Template provided to the Animation ctor */
export interface AnimationTemplate {
  type: AnimationType;
  steps: AnimationStep[];
}

/** Result of Animation updates */
export interface AnimationUpdate {
  type: AnimationType;
  delta: Vector;
}

/**
 * Queues up a sequence of animations and provides the deltas to the caller
 */
export class Animation {
  /**
   * If the animation is locked
   *
   * This gets set on the final animation update.
   */
  private _locked = false;

  /**
   * Create a new Animation instance
   *
   * @param _template - template that describes animation
   */
  constructor(private _template: AnimationTemplate) {}

  /** Determine if all animations have finished */
  get isDone(): boolean {
    return this._hasCompleted() && this._locked;
  }

  /** Determine if all animations have finished */
  private _hasCompleted(): boolean {
    return !this._template.steps.filter((step) => !step.isDone).length;
  }

  /**
   * Update the animation
   *
   * @param dt - delta time
   *
   * @return Animation update
   */
  public update(dt: number): AnimationUpdate {
    const { type, steps } = this._template;

    if (this.isDone) {
      return { type, delta: new Vector(0, 0) };
    }

    const sum = (carry: Vector, update: Vector) => carry.plus(update);
    const delta = steps
      .map((step) => step.update(dt))
      .reduce(sum, new Vector(0, 0));

    if (this._hasCompleted()) {
      this._locked = true;
    }

    return { type, delta };
  }
}
