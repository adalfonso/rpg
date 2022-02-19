import { LevelFixtureTemplate } from "@/level/LevelFixture";
import { Stat } from "@/Stats";
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
  template: LevelFixtureTemplate
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
