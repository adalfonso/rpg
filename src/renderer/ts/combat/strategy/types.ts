import { UiData } from "@/ui/types";

/**
 * Info about an ability
 *
 * @prop description - description of the ability
 * @prop displayAs   - display name
 * @prop isSpecial   - if damage dealt by the ability is based on sp_atk
 * @prop ui          - render info
 * @prop value       - offensive/defensive value of the ability
 *
 */
export type AbilityTemplate = {
  description: string;
  displayAs: string;
  isSpecial: boolean;
  ui: UiData;
  value: number;
};

/**
 * Info about a combat strategy
 *
 * @prop description - description of the strategy
 * @prop displayAs   - display name
 * @prop ui          - render info
 * @prop value       - offensive/defensive value of the strategy
 */
export type CombatStrategyTemplate = {
  description: string;
  displayAs: string;
  ui: UiData;
  value: number;
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
