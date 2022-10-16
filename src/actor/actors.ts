import { SpriteOrientation } from "@/ui/MultiSprite";
import { ActorList } from "./types";

/** All actors contained in the game */
export const actors = (): ActorList => ({
  lea: {
    displayAs: "Lea",
    base_stats: {
      hp: 0,
      atk: 100,
      def: 0,
      sp_atk: 0,
      sp_def: 0,
      spd: 999,
    },
    ui: {
      sprite: "actor.doggo",
      frames: { x: 1, y: 4, idle: 1, north: 1, east: 1, south: 1, west: 1 },
      scale: 1,
      fps: 8,
    },
    abilities: [],
  },
  player: {
    displayAs: "Me",
    base_stats: {
      hp: 120,
      atk: 125,
      def: 85,
      sp_atk: 95,
      sp_def: 65,
      spd: 105,
    },
    ui: {
      sprite: "actor.player",
      frames: { x: 1, y: 4, idle: 1, north: 1, east: 1, south: 1, west: 1 },
      scale: 1,
      fps: 8,
    },
    abilities: [
      { ref: "twister", level: 6 },
      { ref: "mega_punch", level: 6 },
    ],
  },
  pisti: {
    displayAs: "Pisti",
    base_stats: {
      hp: 120,
      atk: 85,
      def: 125,
      sp_atk: 115,
      sp_def: 35,
      spd: 105,
    },
    ui: {
      sprite: "actor.pisti",
      frames: { x: 1, y: 4, idle: 1, north: 1, east: 1, south: 1, west: 1 },
      scale: 1,
      fps: 8,
    },
    abilities: [
      { ref: "proosti", level: 6 },
      { ref: "eat", level: 6 },
    ],
  },
  knight: {
    displayAs: "Knight",
    base_stats: { hp: 80, atk: 65, def: 85, sp_atk: 30, sp_def: 75, spd: 55 },
    teamType: "knights",
    ui: {
      sprite: "actor.knight",
      frames: { x: 8, y: 1, idle: 0, north: 0, east: 1, south: 0, west: 0 },
      scale: 2,
      fps: 8,
      sprite_orientation: SpriteOrientation.Singular,
    },
    abilities: [],
  },
});
