import { RESOLUTION as resolution } from "@/constants";
import MissingDataError from "@/error/MissingDataError";
import { Vector } from "excalibur";
import { Animation, AnimationTemplate } from "@/ui/animation/Animation";
import { AnimationStep, AnimationStepTemplate } from "./AnimationStep";

export type AnimationFactory = (
  name: string
) => (subject?: Vector) => Animation;

/**
 * Generate an animation instance a name-lookup
 *
 * @param animations - record of animations
 * @param name       - name used to lookup record
 * @param subject    - subject entity as a vector (size, position, etc.)
 *
 *
 * @return animation
 */
export const getAnimationFromName =
  (animations: Record<string, AnimationTemplate>) =>
  (name: string) =>
  (subject?: Vector): Animation => {
    const template = animations[name];

    if (!template) {
      throw new MissingDataError(`Cannot load animation "${name}"`);
    }

    return getAnimation(template)(subject);
  };

/**
 * Generate an animation from an AnimationTemplate
 *
 * @param template - template used to bootstrap the Animation
 * @param subject - subject entity as a vector (size, position, etc.)
 *
 * @returns animation
 */
export const getAnimation =
  (template: AnimationTemplate) =>
  (subject?: Vector): Animation => {
    const step_ctor = (template: AnimationStepTemplate) =>
      new AnimationStep(template, { subject, resolution });

    return new Animation(template, step_ctor);
  };
