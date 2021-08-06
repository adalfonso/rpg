import Vector from "@common/Vector";
import { AnimationTemplate, AnimationType } from "./Animation";
import {
  AnimationFunction,
  animations_functions as fn,
} from "./AnimationFunction";

export const animations: Record<string, AnimationTemplate> = {
  stir: {
    type: AnimationType.Position,
    repeat: Infinity,
    steps: [
      {
        delay_ms: 0,
        duration_ms: 150,
        end: () => new Vector(0, -2),
        fn: fn[AnimationFunction.Linear],
      },
      {
        delay_ms: 150,
        duration_ms: 250,
        end: () => new Vector(3, 0),
        fn: fn[AnimationFunction.Linear],
      },
      {
        delay_ms: 300,
        duration_ms: 150,
        end: () => new Vector(0, 2),
        fn: fn[AnimationFunction.Linear],
      },
      {
        delay_ms: 450,
        duration_ms: 250,
        end: () => new Vector(-3, 0),
        fn: fn[AnimationFunction.Linear],
      },
    ],
  },
};
