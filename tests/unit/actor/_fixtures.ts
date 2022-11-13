import * as ex from "excalibur";
import { Direction } from "@/ui/types";
import { Enemy } from "@/actor/Enemy";
import { Pet } from "@/actor/Pet";
import { Player } from "@/actor/Player";
import { getEngine } from "../_fixtures";
import { getTiledTemplate } from "../fixture/_fixtures";

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
  return new Pet(getTiledTemplate());
};

export const getPlayer = () => {
  const engine = getEngine();

  const player = new Player(
    { template: getTiledTemplate(), args: {}, speed: 1 },
    engine
  );

  player.scene = {} as ex.Scene;

  // @ts-ignore
  player._sprites = {
    [Direction.North]: new ex.Animation({ frames: [] }),
    [Direction.East]: new ex.Animation({ frames: [] }),
    [Direction.South]: new ex.Animation({ frames: [] }),
    [Direction.West]: new ex.Animation({ frames: [] }),
    [Direction.None]: new ex.Animation({ frames: [] }),
  };

  return player;
};

export const getEnemy = (input: Record<string, string> = {}) => {
  const { name } = input;
  const enemy = new Enemy(
    getTiledTemplate({
      name: name ?? "_default_enemy",
      class: "_default_enemy",
      x: 1,
      y: 1,
      height: 5,
      width: 5,
    })
  );

  enemy.scene = {} as ex.Scene;

  return enemy;
};
