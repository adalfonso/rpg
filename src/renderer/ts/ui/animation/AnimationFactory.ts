import AnimatedText from "./AnimatedText";
import AnimationQueue from "./AnimationQueue";
import Translation from "./Translation";
import Vector from "@common/Vector";
import { resolution } from "@common/common";

/**
 * Creates various types of animations
 */
class AnimationFactory {
  /**
   * Create the animation for the start of a battle.
   *
   * Scroll text out to the center of the screen so battles don't begin so
   * abruptly.
   *
   * @return an animation queue
   */
  public static createStartBattleAnimation(): AnimationQueue {
    const text = "-    BATTLE START    -";
    const fontSize = 32;

    const options = {
      font: `bold ${fontSize}px Minecraftia`,
      fillStyle: "#0AA",
      shadowColor: "#066",
      shadowOffsetY: 4,
    };

    const textSize = new Vector(
      AnimationFactory.getTextWidth(text, options),
      fontSize
    );

    const start = new Vector(resolution.x, resolution.y / 2 - textSize.y / 2);

    const end = new Vector(
      resolution.x / 2 - textSize.x / 2,
      resolution.y / 2 - textSize.y / 2
    );

    const stages = [
      new Translation(start, end, 1000),
      new Translation(end, end, 1000),
    ];

    const animation = new AnimatedText(text, options);

    return new AnimationQueue(stages, animation);
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

export default AnimationFactory;
