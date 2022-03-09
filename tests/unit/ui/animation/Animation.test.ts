import Vector from "@common/Vector";
import { Animation as Sut, AnimationType } from "@/ui/animation/Animation";
import {
  AnimationStep,
  AnimationStepTemplate,
} from "@/ui/animation/AnimationStep";

describe("Animation", () => {
  describe("update", () => {
    it("updates a no-op step", () => {
      const steps = [getAnimationStepTemplates()[0]];

      let count = 0;

      (<AnimationStep>(<any>steps[0])).update = () => {
        count++;
        return count === 2 ? new Vector(1, 1) : Vector.empty();
      };

      const template = {
        type: AnimationType.Position,
        steps,
      };

      const sut = new Sut(template, createBasicStep);

      const expected = {
        type: AnimationType.Position,
        delta: Vector.empty(),
      };

      expect(sut.update(0)).toEqual(expected);
      sut.update(1000);
      expect(sut.update(500)).toEqual(expected);
    });

    it("updates a single step", () => {
      const steps = [getAnimationStepTemplates()[0]];

      (<AnimationStep>(<any>steps[0])).update = () => {
        return new Vector(1, 1);
      };

      const template = {
        type: AnimationType.Position,
        steps,
      };

      const sut = new Sut(template, createBasicStep);

      const expected = {
        type: AnimationType.Position,
        delta: new Vector(1, 1),
      };

      expect(sut.update(100)).toEqual(expected);
    });

    it("updates a multi step", () => {
      const template = {
        type: AnimationType.Position,
        steps: getAnimationStepTemplates(),
      };

      template.steps.forEach((step) => {
        (<AnimationStep>(<any>step)).update = () => {
          return new Vector(1, 1);
        };
      });

      const sut = new Sut(template, createBasicStep);

      const expected = {
        type: AnimationType.Position,
        delta: new Vector(2, 2),
      };

      expect(sut.update(100)).toEqual(expected);
    });
  });

  describe("isDone", () => {
    it("detects when an animation is done", () => {
      const steps = [getAnimationStepTemplates()[0]];

      (<any>steps[0]).isDone = true;

      const template = {
        type: AnimationType.Position,
        steps,
      };

      const sut = new Sut(template, createBasicStep);

      expect(sut.update(100).delta.toArray()).toEqual([1, 1]);
      expect(sut.isDone).toBe(true);
      expect(sut.update(100).delta.toArray()).toEqual([0, 0]);
      expect(sut.isDone).toBe(true);
    });
  });
});

const getAnimationStepTemplates = (): AnimationStepTemplate[] => {
  const templates = [
    {
      delay_ms: 0,
      duration_ms: 1000,
      end: <Vector>(<unknown>{}),
      fn: getStepTemplates(),
      update: () => new Vector(1, 1),
      refresh: () => {},
    },
    {
      delay_ms: 1000,
      duration_ms: 1000,
      end: <Vector>(<unknown>{}),
      fn: getStepTemplates(),
      update: () => new Vector(1, 1),
      refresh: () => {},
    },
  ];

  return <AnimationStepTemplate[]>(<any>templates);
};

function getStepTemplates() {
  return (_percent: number, _end: Vector) => {
    return <Vector>{};
  };
}

const createBasicStep = (step: AnimationStepTemplate) =>
  <AnimationStep>(<any>step);
