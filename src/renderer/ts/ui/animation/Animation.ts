import Vector from "@common/Vector";
import { AnimationStep, AnimationStepTemplate } from "./AnimationStep";

/** Legal Animation types */
export enum AnimationType {
  Position,
}

/** Template provided to the Animation ctor */
export interface AnimationTemplate {
  type: AnimationType;
  repeat?: number;
  steps: AnimationStepTemplate[];
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

  private _steps: AnimationStep[] = [];

  private _iterations = 0;

  /**
   * Create a new Animation instance
   *
   * @param _template - template that describes animation
   */
  constructor(
    private _template: AnimationTemplate,
    step_ctor: (step: AnimationStepTemplate) => AnimationStep
  ) {
    this._steps = this._template.steps.map(step_ctor);
  }

  /** Determine if all animations have finished */
  get isDone(): boolean {
    return this._hasCompleted() && this._locked;
  }

  /** Determine if all animations have finished n number of times*/
  private _hasCompleted(): boolean {
    const iterations = this._template.repeat ?? 1;

    return this._iterations >= iterations && this._hasIterated();
  }

  /** Determine if all animation steps have finished */
  private _hasIterated(): boolean {
    return !this._steps.filter((step) => !step.isDone).length;
  }

  /**
   * Update the animation
   *
   * @param dt - delta time
   *
   * @return Animation update
   */
  public update(dt: number): AnimationUpdate {
    const { type } = this._template;

    if (this.isDone) {
      return { type, delta: new Vector(0, 0) };
    }

    const sum = (carry: Vector, update: Vector) => carry.plus(update);
    const delta = this._steps
      .map((step) => step.update(dt))
      .reduce(sum, new Vector(0, 0));

    if (this._hasIterated() && !this._hasCompleted()) {
      this._iterations++;
      this._steps.forEach((step) => step.refresh());
      console.log(this._iterations, this._template.repeat ?? "none");
    }

    if (this._hasCompleted()) {
      this._locked = true;
    }

    return { type, delta };
  }
}
