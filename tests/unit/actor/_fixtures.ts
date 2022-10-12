import Enemy from "@/actor/Enemy";
import Player from "@/actor/Player";
import { Vector } from "excalibur";
import { Pet } from "@/actor/Pet";

export const getActorTemplate = () => ({
  x: 1,
  y: 1,
  height: 5,
  width: 5,
  name: "_default_actor",
  type: "_default_actor",
});

export const getActorConfig = () => ({
  displayAs: "Mr Foo",
  base_stats: { hp: 120, atk: 125, def: 85, sp_atk: 95, sp_def: 65, spd: 105 },
  ui: {
    sprite: "missing",
    frames: { x: 1, y: 4, idle: 1, north: 1, east: 1, south: 1, west: 1 },
    scale: 1,
    fps: 8,
  },
  abilities: [{ ref: "_default_ability", level: 6 }],
});

export const getPet = () => {
  return new Pet(Vector.Zero, Vector.Zero, getActorTemplate());
};

export const getPlayer = (input: Record<string, unknown> = {}) => {
  const { size } = input;
  return new Player(
    Vector.Zero,
    (size as Vector) ?? Vector.Zero,
    getActorTemplate()
  );
};

export const getEnemy = (input: Record<string, string> = {}) => {
  const { name } = input;
  return new Enemy(Vector.Zero, Vector.Zero, {
    name: name ?? "_default_enemy",
    type: "_default_enemy",
    x: 1,
    y: 1,
    height: 5,
    width: 5,
  });
};
