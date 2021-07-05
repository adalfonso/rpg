import Vector from "@common/Vector";
import { Animation as Sut, AnimationType } from "@/ui/animation/Animation";
import { AnimationStep } from "@/ui/animation/AnimationStep";
import { expect } from "chai";

describe("Animation", () => {
  describe("update", () => {
    it("updates a no-op step", () => {
      const steps = [getAnimations()[0]];

      let count = 0;

      steps[0].update = () => {
        count++;
        return count === 2 ? new Vector(1, 1) : new Vector(0, 0);
      };

      const template = {
        type: AnimationType.Position,
        steps,
      };

      const sut = new Sut(template);

      const expected = {
        type: AnimationType.Position,
        delta: new Vector(0, 0),
      };

      expect(sut.update(0)).to.deep.equal(expected);
      sut.update(1000);
      expect(sut.update(500)).to.deep.equal(expected);
    });

    it("updates a single step", () => {
      const steps = [getAnimations()[0]];

      const template = {
        type: AnimationType.Position,
        steps,
      };

      const sut = new Sut(template);

      const expected = {
        type: AnimationType.Position,
        delta: new Vector(1, 1),
      };

      expect(sut.update(100)).to.deep.equal(expected);
    });

    it("updates a multi step", () => {
      const template = {
        type: AnimationType.Position,
        steps: getAnimations(),
      };

      const sut = new Sut(template);

      const expected = {
        type: AnimationType.Position,
        delta: new Vector(2, 2),
      };

      expect(sut.update(100)).to.deep.equal(expected);
    });
  });

  describe("isDone", () => {
    it("detects when an animation is done", () => {
      const steps = [getAnimations()[0]];

      (<any>steps[0]).isDone = true;

      const template = {
        type: AnimationType.Position,
        steps,
      };

      const sut = new Sut(template);

      expect(sut.update(100).delta.toArray()).to.deep.equal([1, 1]);
      expect(sut.isDone).to.be.true;
      expect(sut.update(100).delta.toArray()).to.deep.equal([0, 0]);
      expect(sut.isDone).to.be.true;
    });
  });
});

function getAnimations() {
  const templates = [
    {
      delay_ms: 0,
      duration_ms: 1000,
      end: <Vector>(<unknown>{}),
      fn: getAnimationFn(),
    },
    {
      delay_ms: 1000,
      duration_ms: 1000,
      end: <Vector>(<unknown>{}),
      fn: getAnimationFn(),
    },
  ];

  return templates.map((template) => {
    return <AnimationStep>{
      update: (dt: number) => new Vector(1, 1),
    };
  });
}

function getAnimationFn() {
  const count = 0;
  return (percent: number, end: Vector) => {
    return <Vector>{};
  };
}
