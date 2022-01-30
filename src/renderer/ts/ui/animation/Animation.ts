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
 *
 * This class represents the underlying animation data for some entity in the
 * game, be it a player, enemy, item, text string, etc. This class keeps track of
 * the state of the animation as a function of time. This class should be used
 * by some other struct that will coordinate the entity's affected properties.
 **/
export class Animation {
  /**
   * If the animation is locked
   *
   * This gets set on the final animation update.
   */
  private _locked = false;

  /** Sub-steps of the broader animation */
  private _steps: AnimationStep[] = [];

  /** Number of times the animation has run */
  private _iterations = 0;

  /**
   * Create a new Animation instance
   *
   * @param _template - template that describes animation
   * @param step_ctor - create an AnimationStep from a template
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
    const iterations = this._template.repeat ?? 0;

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

    // Animation is officially done
    if (this.isDone) {
      return { type, delta: new Vector(0, 0) };
    }

    const sum = (carry: Vector, update: Vector) => carry.plus(update);
    const delta = this._steps
      .map((step) => step.update(dt))
      .reduce(sum, new Vector(0, 0));

    /**
     * Animation has run (iterated) at least once but is not fully completed.
     * The animation may not yet be completed because it will iterate multiple
     * times, or because the current iteration has not yet been recorded.
     */
    if (this._hasIterated() && !this._hasCompleted()) {
      this._iterations++;
      this._steps.forEach((step) => step.refresh());
    }

    // All iterations have completed
    if (this._hasCompleted()) {
      this._locked = true;
    }

    return { type, delta };
  }
}
