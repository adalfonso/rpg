import MissingDataError from "@/error/MissingDataError";
import { Vector } from "excalibur";
import { AnimatedText } from "./AnimatedText";
import { animations } from "./animations";
import { config, RenderOptions } from "./text";
import { getAnimationFromName } from "../AnimationFactory";

/** Creates various types of animations */
export class AnimatedTextFactory {
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
    const animation_name = "scroll_in_left_to_right";
    const font_size = 32;
    const options = config.event;

    const text_size = new Vector(
      AnimatedTextFactory.getTextWidth(text, options),
      font_size
    );

    const animation =
      getAnimationFromName(animations)(animation_name)(text_size);

    return new AnimatedText(text, animation, Vector.Zero, options);
  }

  /**
   * Get the width of a string while considering certain render options
   *
   * @param text    - text to measure
   * @param options - render options
   *
   * @return text's width (in pixels)
   */
  public static getTextWidth(text: string, options: RenderOptions) {
    const ctx = document.createElement("canvas").getContext("2d");

    if (ctx === null) {
      throw new MissingDataError(
        `Failed to read context when calculating text width`
      );
    }

    for (const option in options) {
      ctx[option] = options[option];
    }

    return ctx.measureText(text).width;
  }
}
