import { Vector } from "excalibur";
import { AnimationFunction, animations_functions } from "./AnimationFunction";
import { AnimationType } from "./Animation";
import { getAnimation } from "./AnimationFactory";

/** Options used to configure a custom translation animation */
export interface TranslationAnimationOptions {
  translation: Vector;
  repeat?: number;
  delay_ms?: number;
  duration_ms?: number;
  fn?: AnimationFunction;
  subject?: Vector;
}

/**
 * Generate an animation template for a translation animation
 *
 * @param options - configuration options for the translation
 *
 * @returns translation animation template
 */
const getTranslationAnimationTemplate = (
  options: TranslationAnimationOptions
) =>
  getAnimation({
    type: AnimationType.Position,
    repeat: 0,
    steps: [
      {
        delay_ms: options.delay_ms ?? 0,
        duration_ms: options.duration_ms ?? 500,
        end: () => options.translation,
        fn: animations_functions[options.fn ?? AnimationFunction.Linear],
      },
    ],
  })(options.subject);

/** Aggregate of animation creators */
export const createAnimation = {
  translation: getTranslationAnimationTemplate,
};
