import MissingDataError from "@/error/MissingDataError";
import Vector from "@common/Vector";
import { Animation, AnimationTemplate } from "@/ui/animation/Animation";
import { AnimationStep, AnimationStepTemplate } from "./AnimationStep";
import { resolution } from "@common/common";

export type AnimationFactory = (name: string) => (subject: Vector) => Animation;

/**
 * Generate an animation instance
 *
 * @param animations - record of animations
 * @param name       - name used to lookup record
 * @param subject    - subject entity as a vector
 *
 * @return animation
 */
export const getAnimation =
  (animations: Record<string, AnimationTemplate>) =>
  (name: string) =>
  (subject: Vector): Animation => {
    const template = animations[name];

    if (!template) {
      throw new MissingDataError(`Cannot load animation "${name}"`);
    }

    const steps = template.steps.map(
      (step: AnimationStepTemplate) =>
        new AnimationStep(step, { subject, resolution })
    );

    const step_ctor = (template: AnimationStepTemplate) =>
      new AnimationStep(template, { subject, resolution });

    return new Animation(template, step_ctor);
  };
