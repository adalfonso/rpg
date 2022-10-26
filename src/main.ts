import "./_resource/css/app.css";
import * as ex from "excalibur";
import config from "@/config";
import { APP_NAME, SAVE_FILE, RESOLUTION, SAVE_DIR } from "./constants";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { HeroTeam } from "./combat/HeroTeam";
import { Mediator } from "./Mediator";
import { Pet } from "./actor/Pet";
import { Player } from "./actor/Player";
import { createTiledTemplate, loadImages, resolveSaveData } from "@/util";
import { path } from "@tauri-apps/api";
import { state } from "@/state/StateManager";

const new_main = async () => {
  const save_dir = await resolveSaveData(APP_NAME)(SAVE_DIR);
  const save_path = await path.join(save_dir, SAVE_FILE);

  await state().load(save_path);
  const canvasElement = <HTMLCanvasElement>document.getElementById("game");

  const engine = new ex.Engine({
    width: RESOLUTION.x * config.scale,
    height: RESOLUTION.y * config.scale,
    displayMode: ex.DisplayMode.FillScreen,
    antialiasing: false,
    suppressPlayButton: true,
    resolution: {
      width: RESOLUTION.x,
      height: RESOLUTION.y,
    },
    canvasElement,
  });

  const player = new Player(
    {
      // TODO: Don't type assert
      template: createTiledTemplate({
        x: 455,
        y: 75,
        width: 18,
        height: 32,
        name: "Me",
        class: "player",
      }),
      args: { collisionType: ex.CollisionType.Active },
      speed: 100,
    },
    engine
  );

  const doggo = new Pet(
    createTiledTemplate({
      name: "Lea",
      class: "lea",
      x: player.pos.x,
      y: player.pos.y,
      width: 20,
      height: 16,
    })
  );
  player.adoptPet(doggo);

  const heroes = new HeroTeam([player], engine);
  const dialogue = new DialogueMediator(heroes);
  const images = loadImages();
  const loader = new ex.Loader(Object.values(images));
  const mediator = new Mediator(engine, heroes, dialogue);

  await mediator.start(loader);
};

document.addEventListener("DOMContentLoaded", new_main);
