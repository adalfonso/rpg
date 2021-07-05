import { Stat } from "@/Stats";
/**
 * Basic description for an entity
 *
 * @prop displayAs   - display name
 * @prop description - description
 */
export interface EntityTemplate {
  displayAs: string;
  description: string;
}

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

/**
 * An temporary effect placed on an actor's stats
 *
 * @prop displayAs   - display name
 * @prop description - description
 * @prop stat        - target stat
 * @prop self        - if the modifier is applied to the user
 * @prop value       - amount to affect stat by
 * @prop duration    - number of turns to persist effect
 */
export type StatModifierTemplate = {
  displayAs: string;
  description: string;
  stat: Stat;
  self: boolean;
  value: number;
  duration: number;
};
