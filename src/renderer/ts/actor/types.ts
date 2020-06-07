import { ActorUiData } from "@/ui/types";
import { LearnedAbility } from "@/combat/strategy/types";
import { StatTemplate } from "@/Stats";

/**
 * Template data for an actor
 *
 * @prop baseStats - base stats scale
 * @prop displayAs - display name
 * @prop abilities - abilities learned
 * @prop teamType  - reference to team type for battles
 * @prop ui        - render info
 */
export type ActorTemplate = {
  abilities: LearnedAbility[];
  baseStats: StatTemplate;
  displayAs: string;
  teamType?: string;
  ui: ActorUiData;
};

/**
 * A list of actors
 */
export type ActorList = {
  [key: string]: ActorTemplate;
};
