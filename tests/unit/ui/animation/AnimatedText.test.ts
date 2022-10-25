import { Vector } from "excalibur";
import { AnimatedText as Sut } from "@/ui/animation/text/AnimatedText";
import { Animation, AnimationType } from "@/ui/animation/Animation";

describe("AnimatedText", () => {
  describe("update", () => {
    it("updates text position", () => {
      let animation = getAnimation();

      let sut = new Sut("", animation, Vector.Zero, {});

      sut.update(100);

      const results: number[][] = [];
      const expected = [[500, 500]];

      const ctx = <CanvasRenderingContext2D>{
        fillText(_, position_x, position_y) {
          results.push([position_x, position_y]);
        },
        save: () => {},
        restore: () => {},
      };

      sut.draw2D(ctx, Vector.Zero, Vector.Zero);

      expect(results).toEqual(expected);
    });
  });

  describe("isDone", () => {
    it("detects when it is done", () => {
      let animation = getAnimation();

      let sut = new Sut("", animation, Vector.Zero, {});
      expect(sut.isDone).toBe(false);
      (<any>animation).isDone = true;
      expect(sut.isDone).toBe(true);
    });
  });
});

const getAnimation = () => <Animation>(<unknown>{
    update: () => ({
      type: AnimationType.Position,
      delta: new Vector(500, 500),
    }),
    isDone: false,
  });
