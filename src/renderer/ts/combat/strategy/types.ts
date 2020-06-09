import { Stat } from "@/Stats";
import { UiData } from "@/ui/types";

/**
 * Basic description for an entity
 *
 * @prop displayAs   - display name
 * @prop description - description
 */
export type DescriptiveTemplate = {
  displayAs: string;
  description: string;
};

/**
 * An ability constrained to a level
 *
 * @prop level - level at which the ability is learned
 * @prop ref   - ref to ability key
 */
export type LearnedAbility = {
  level: number;
  ref: string;
};
