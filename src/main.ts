import "./_resource/css/app.css";
import * as Tiled from "@excaliburjs/plugin-tiled";
import * as ex from "excalibur";
import Display from "@/ui/Display";
import Game from "@/game/Game";
import config from "@/config";
import { APP_NAME, SAVE_FILE, RESOLUTION, SAVE_DIR } from "./constants";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { HeroTeam } from "./combat/HeroTeam";
import { LevelFixtureFactory } from "./level/LevelFixtureFactory";
import { Pet } from "./actor/Pet";
import { Player } from "./actor/Player";
import { TiledMap } from "./TiledMap";
import { getSprites } from "./ui/DirectionalSprite";
import { isLevelFixtureType, LevelFixtureType } from "./level/LevelFixture";
import { loadImages } from "./loader";
import { path } from "@tauri-apps/api";
import { resolveSaveData, startAnimation } from "@/util";
import { state } from "@/state/StateManager";

const _main = async (_event) => {
  const save_dir = await resolveSaveData(APP_NAME)(SAVE_DIR);
  const save_path = await path.join(save_dir, SAVE_FILE);

  await state().load(save_path);

  const canvas = <HTMLCanvasElement>document.getElementById("game");
  const player_template = {
    x: 75,
    y: 75,
    width: 18,
    height: 32,
    name: "Me",
    class: "player",
  };
  const player_position = new ex.Vector(player_template.x, player_template.y);
  const player_size = new ex.Vector(
    player_template.width,
    player_template.height
  );
  const player = new Player(
    player_position.scale(config.scale),
    player_size.scale(config.scale),
    player_template
  );

  const doggo = new Pet(player.position.clone(), player.size.clone(), {
    name: "Lea",
    class: "lea",
    x: 0,
    y: 0,
    width: 16,
    height: 32,
  });
  player.adoptPet(doggo);

  const team = new HeroTeam([player]);
  const dialogue = new DialogueMediator(team);
  const game = new Game(team, dialogue);
  const display = new Display(RESOLUTION, canvas, game);

  startAnimation((dt: number) => {
    game.update(dt);
    display.draw();
  });
};

const new_main = async () => {
  const canvasElement = <HTMLCanvasElement>document.getElementById("game");
  const map = new TiledMap("src/_resource/map/sandbox_0.json");

  const game = new ex.Engine({
    // width: RESOLUTION.x * config.scale,
    // height: RESOLUTION.y * config.scale,
    width: RESOLUTION.x,
    height: RESOLUTION.y,
    antialiasing: false,
    suppressPlayButton: true,
    resolution: {
      width: RESOLUTION.x,
      height: RESOLUTION.y,
    },
    canvasElement,
  });

  const images = loadImages();
  const loader = new ex.Loader([map, ...Object.values(images)]);

  await game.start(loader);

  map.addTiledMapToScene(game.currentScene);

  const fixture_factory = new LevelFixtureFactory();

  const fixtures = map.data
    .getExcaliburObjects()
    .filter(({ name = "" }) => {
      return isLevelFixtureType(name);
    })
    .map(({ name, objects }) => {
      return objects.map((object) => {
        if (object.class === undefined) {
          object.class === name;
        }

        return fixture_factory.create(name as LevelFixtureType, object);
      });
    })
    .forEach((fixture) => {
      game.currentScene.add(fixture);
    });

  const player = new Player(
    {
      // TODO: Don't type assert
      template: {
        x: 75,
        y: 75,
        width: 18,
        height: 32,
        name: "Me",
        class: "player",
      } as Tiled.TiledObject,
      args: { collisionType: ex.CollisionType.Active },
      speed: 100,
      sprites: getSprites(images.player, {
        size: ex.vec(18, 32),
        columns: 1,
      }),
    },
    game
  );
};

document.addEventListener("DOMContentLoaded", new_main);
