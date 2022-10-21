import Ability from "./Ability";
import { Stat } from "@/actor/Stats";
import { TiledTemplate } from "@/actor/types";
/**
 * Basic description for an entity
 *
 * @prop displayAs   - display name
 * @prop description - description
 */
export interface EntityConfig {
  displayAs: string;
  description: string;
}

export type EntityConfigFactory<T extends EntityConfig> = (
  template: TiledTemplate
) => T;

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

/** Used to store an ability on the Actor*/
export interface AbilityList {
  level: number;
  ability: Ability;
}

export interface BaseAbilityTemplate {
  displayAs: string;
  description: string;
  value: number;
  ui: {
    sprite: string;
  };
}

export interface StatModifierTemplate extends BaseAbilityTemplate {
  stat: Stat;
  duration: number;
  self: boolean;
}

export interface DamageDealingAbilityTemplate extends BaseAbilityTemplate {
  isSpecial: boolean;
}

export interface AbilityManifest {
  damage: Record<string, DamageDealingAbilityTemplate>;
  stat: Record<string, StatModifierTemplate>;
}
