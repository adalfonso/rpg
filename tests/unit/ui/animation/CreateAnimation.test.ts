import { Vector } from "excalibur";
import { AnimationType, AnimationUpdate } from "@/ui/animation/Animation";
import {
  createAnimation,
  TranslationAnimationOptions,
} from "@/ui/animation/CreateAnimation";

describe("CreateAnimation", () => {
  describe("translation", () => {
    interface TranslationTest {
      _it: string;
      input: TranslationAnimationOptions;
      expected: AnimationUpdate[];
    }

    (
      [
        {
          _it: "creates a translation with default settings",
          input: { translation: new Vector(2, 2) },
          expected: [
            {
              type: AnimationType.Position,
              delta: Vector.Zero,
            },
            {
              type: AnimationType.Position,
              delta: new Vector(1, 1),
            },
            {
              type: AnimationType.Position,
              delta: new Vector(1, 1),
            },
          ],
        },
        {
          _it: "creates a translation with custom settings",
          input: {
            translation: new Vector(100, 100),
            delay_ms: 50,
            duration_ms: 200,
          },
          expected: [
            {
              type: AnimationType.Position,
              delta: Vector.Zero,
            },
            {
              type: AnimationType.Position,
              delta: new Vector(50, 50),
            },
            {
              type: AnimationType.Position,
              delta: new Vector(50, 50),
            },
          ],
        },
      ] as TranslationTest[]
    ).forEach(({ input, expected, _it }) => {
      it(_it, () => {
        const animation = createAnimation.translation(input);
        const halfway = (input.delay_ms || 0) + (input.duration_ms || 500) / 2;

        expect(animation.update(0)).toEqual(expected[0]);
        expect(animation.isDone).toBe(false);
        expect(animation.update(halfway)).toEqual(expected[1]);
        expect(animation.isDone).toBe(false);
        expect(animation.update(halfway)).toEqual(expected[2]);
        expect(animation.isDone).toBe(true);
      });
    });
  });
});
