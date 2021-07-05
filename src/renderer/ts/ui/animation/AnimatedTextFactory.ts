import Vector from "@common/Vector";
import { AnimatedText } from "./AnimatedText";
import { Animation, AnimationType } from "./Animation";
import { AnimationFunction, animations_functions } from "./AnimationFunction";
import { AnimationStep } from "@/ui/animation/AnimationStep";
import { resolution } from "@common/common";

/**
 * Creates various types of animations
 */
class AnimatedTextFactory {
  /**
   * Create the animation for the start of a battle.
   *
   * Scroll text out to the center of the screen so battles don't begin so
   * abruptly.
   *
   * @return an text animation
   */
  public static createStartBattleAnimation(): AnimatedText {
    const text = "-    BATTLE START    -";
    const font_size = 32;

    // TODO: move this into a config
    const options = {
      font: `bold ${font_size}px Minecraftia`,
      fillStyle: "#0AA",
      shadowColor: "#066",
      shadowOffsetY: 4,
    };

    const text_size = new Vector(
      AnimatedTextFactory.getTextWidth(text, options),
      font_size
    );

    // TODO: move this into a config
    const steps = [
      // Move off-screen
      {
        delay_ms: 0,
        duration_ms: 0,
        end: (resolution: Vector, text_size: Vector) =>
          new Vector(-text_size.x, resolution.y / 2 + text_size.y),
        fn: animations_functions[AnimationFunction.Linear],
      },
      // Slide in
      {
        delay_ms: 0,
        duration_ms: 1000,
        end: (resolution: Vector, text_size: Vector) =>
          new Vector(resolution.x / 2 + text_size.x / 2, 0),
        fn: animations_functions[AnimationFunction.Linear],
      },
      // Wait 1000s
      {
        delay_ms: 1000,
        duration_ms: 1000,
        end: () => new Vector(0, 0),
        fn: animations_functions[AnimationFunction.Linear],
      },
    ].map((step) => new AnimationStep(step, { resolution, text_size }));

    const animation = new Animation({ type: AnimationType.Position, steps });

    return new AnimatedText(text, animation, new Vector(0, 0), options);
  }

  /**
   * Get the width of a string while considering certain render options
   *
   * @param text    - text to measure
   * @param options - render options
   *
   * @return text's width (in pixels)
   */
  public static getTextWidth(text: string, options: object): number {
    const ctx = document.createElement("canvas").getContext("2d");

    for (let option in options) {
      ctx[option] = options[option];
    }

    return ctx.measureText(text).width;
  }
}

export default AnimatedTextFactory;
