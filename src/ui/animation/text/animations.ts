import MissingDataError from "@/error/MissingDataError";
import { Vector } from "excalibur";
import { AnimationTemplate, AnimationType } from "../Animation";
import {
  AnimationFunction,
  animations_functions as fn,
} from "../AnimationFunction";

export const animations: Record<string, AnimationTemplate> = {
  scroll_in_left_to_right: {
    type: AnimationType.Position,
    steps: [
      // Move off-screen
      {
        delay_ms: 0,
        duration_ms: 0,
        end: (subject?: Vector, resolution?: Vector) => {
          if (!subject || !resolution) {
            throw new MissingDataError("Vector missing for animation end");
          }

          return new Vector(-subject.x, resolution.y / 2 + subject.y);
        },
        fn: fn[AnimationFunction.Linear],
      },
      // Slide in
      {
        delay_ms: 0,
        duration_ms: 1000,
        end: (subject?: Vector, resolution?: Vector) => {
          if (!subject || !resolution) {
            throw new MissingDataError("Vector missing for animation end");
          }

          return new Vector(resolution.x / 2 + subject.x / 2, 0);
        },
        fn: fn[AnimationFunction.Linear],
      },
      // Wait 1000s
      {
        delay_ms: 1000,
        duration_ms: 750,
        end: () => Vector.Zero,
        fn: fn[AnimationFunction.Linear],
      },
    ],
  },
};
