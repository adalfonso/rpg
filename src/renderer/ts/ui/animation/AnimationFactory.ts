import Vector from "@common/Vector";
import { Animation } from "@/ui/animation/Animation";
import { AnimationStep, AnimationStepTemplate } from "./AnimationStep";
import { resolution } from "@common/common";

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
  (animations: any) =>
  (name: string) =>
  (subject: Vector): Animation => {
    const config = animations[name];

    const steps = config.steps.map(
      (step: AnimationStepTemplate) =>
        new AnimationStep(step, { subject, resolution })
    );

    return new Animation({ type: config.type, steps });
  };
