import Vector from "@common/Vector";
import { AnimatedText as Sut } from "@/ui/animation/text/AnimatedText";
import { Animation, AnimationType } from "@/ui/animation/Animation";
import { expect } from "chai";

describe("AnimatedText", () => {
  describe("update", () => {
    it("updates text position", () => {
      let animation = getAnimation();

      let sut = new Sut("", animation, Vector.empty(), {});

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

      sut.draw(ctx, Vector.empty(), Vector.empty());

      expect(results).to.deep.equal(expected);
    });
  });

  describe("isDone", () => {
    it("detects when it is done", () => {
      let animation = getAnimation();

      let sut = new Sut("", animation, Vector.empty(), {});
      expect(sut.isDone).to.be.false;
      (<any>animation).isDone = true;
      expect(sut.isDone).to.be.true;
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
