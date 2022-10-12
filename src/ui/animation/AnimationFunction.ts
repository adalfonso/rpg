import { Vector } from "excalibur";

/** Animation functions */
export enum AnimationFunction {
  Linear,
}

/**
 * Apply an animation function
 *
 * Animation functions assume starting data of a [0, 0] vector.
 *
 * @param percent - percentage of the animation completed as a function of time
 * @param end     - ending position, size, etc.
 *
 * @return current position, size, etc.
 */
export type AnimationFunctionApplication = (
  percent: number,
  end: Vector
) => Vector;

/** List of animation function names to their behavior */
export const animations_functions: Record<
  AnimationFunction,
  AnimationFunctionApplication
> = {
  [AnimationFunction.Linear]: (percent: number, end: Vector) =>
    end.scale(percent),
};
