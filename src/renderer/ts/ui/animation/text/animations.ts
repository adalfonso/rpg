import Vector from "@common/Vector";
import { AnimationType } from "../Animation";
import {
  AnimationFunction,
  animations_functions as fn,
} from "../AnimationFunction";

export const animations = {
  scroll_in_left_to_right: {
    type: AnimationType.Position,
    steps: [
      // Move off-screen
      {
        delay_ms: 0,
        duration_ms: 0,
        end: (subject: Vector, resolution: Vector) =>
          new Vector(-subject.x, resolution.y / 2 + subject.y),
        fn: fn[AnimationFunction.Linear],
      },
      // Slide in
      {
        delay_ms: 0,
        duration_ms: 1000,
        end: (subject: Vector, resolution: Vector) =>
          new Vector(resolution.x / 2 + subject.x / 2, 0),
        fn: fn[AnimationFunction.Linear],
      },
      // Wait 1000s
      {
        delay_ms: 1000,
        duration_ms: 750,
        end: () => new Vector(0, 0),
        fn: fn[AnimationFunction.Linear],
      },
    ],
  },
};
