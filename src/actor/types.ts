import * as Tiled from "@excaliburjs/plugin-tiled";
import * as ex from "excalibur";
import { ActorUiData } from "@/ui/types";
import { LearnedAbility } from "@/combat/strategy/types";
import { StatTemplate } from "@/actor/Stats";

export type ActorInitArgs = Tiled.TiledObject | ex.ActorArgs;

/**
 * Template data for an actor
 *
 * @prop base_stats - base stats scale
 * @prop displayAs - display name
 * @prop abilities - abilities learned
 * @prop teamType  - reference to team type for battles
 * @prop ui        - render info
 */
export type ActorConfig = {
  abilities: LearnedAbility[];
  base_stats: StatTemplate;
  displayAs: string;
  teamType?: string;
  ui: ActorUiData;
};

export type ActorList = Record<string, ActorConfig>;

/**
 * Template data for actor speech
 *
 * @prop dialogue - list of speech/dialogue
 */
export type Speech = {
  dialogue: string[];
};

export type SpeechList = Record<string, Record<string, Speech>>;
