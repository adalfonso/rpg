import Actor from "@/actor/Actor";
import { Vector } from "excalibur";
import { Animation, AnimationType } from "../Animation";

/** Animation implementation for a common entity */
export class AnimatedEntity {
  /**
   * @param _animation - current animation applied to the entity
   * @param _entity - the entity to animate
   */
  constructor(private _animation: Animation, private _entity: Actor) {}

  /** If the animation is done */
  get isDone(): boolean {
    return this._animation.isDone;
  }

  /**
   * Update the animation
   *
   * @param dt - delta time
   */
  public update(dt: number) {
    if (this.isDone) {
      return;
    }

    const { type, delta } = this._animation.update(dt);

    // only handles position animations for now
    if (type !== AnimationType.Position) {
      return;
    }

    this.move(delta);
  }

  /**
   * Change the entity's position
   *
   * @param delta - position change
   */
  private move(delta: Vector) {
    this._entity.moveTo(this._entity.position.add(delta));
  }
}
