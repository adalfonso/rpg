import { Vector } from "excalibur";
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

/** Options used to configure a custom translation animation */
interface TranslationAnimationOptions {
  translation: Vector;
  repeat?: number;
  delay_ms?: number;
  duration_ms?: number;
  animation_fn?: AnimationFunction;
}

/**
 * Generate an animation template for a translation animation
 *
 * @param options - configuration options for the translation
 * @returns translation animation template
 */
const getTranslationAnimationTemplate = (
  options: TranslationAnimationOptions
): AnimationTemplate => ({
  type: AnimationType.Position,
  repeat: options.repeat ?? 0,
  steps: [
    {
      delay_ms: options.delay_ms ?? 0,
      duration_ms: options.duration_ms ?? 500,
      end: () => options.translation,
      fn: fn[options.animation_fn ?? AnimationFunction.Linear],
    },
  ],
});

/** Aggregate of animation creators */
export const createAnimation = {
  translation: getTranslationAnimationTemplate,
};
