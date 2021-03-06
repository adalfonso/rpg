import Vector from "@common/Vector";
import * as Sut from "@/ui/animation/AnimationFunction";
import { expect } from "chai";

describe("AnimationFunction", () => {
  describe("animation_functions", () => {
    describe("Linear", () => {
      const fn = Sut.animations_functions[Sut.AnimationFunction.Linear];

      it("performs a linear transformation", () => {
        [
          {
            end: new Vector(4, 4),
            percent: 0.25,
            result: [1, 1],
          },
          {
            end: new Vector(4, 4),
            percent: 0.5,
            result: [2, 2],
          },
          {
            end: new Vector(4, 4),
            percent: 1,
            result: [4, 4],
          },
          {
            end: new Vector(10, 10),
            percent: 0.45,
            result: [4.5, 4.5],
          },
        ].forEach(({ end, percent, result }) => {
          expect(fn(percent, end).toArray()).to.deep.eq(result);
        });
      });
    });
  });
});
