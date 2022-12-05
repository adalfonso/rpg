import "./_resource/css/app.css";
import * as ex from "excalibur";
import { APP_NAME, SAVE_FILE, RESOLUTION, SAVE_DIR } from "./constants";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { HeroTeam } from "./combat/HeroTeam";
import { Mediator } from "./Mediator";
import { Pet } from "./actor/Pet";
import { Player } from "./actor/Player";
import { createEquipper } from "./combat/EquipperFactory";
import { createMenus } from "./menu/MenuFactory";
import { path } from "@tauri-apps/api";
import { state } from "@/state/StateManager";
import { toTiledTemplate, loadImages, resolveSaveData, scale } from "@/util";
import { FixtureMediator } from "./fixture/FixtureMediator";

const main = async () => {
  const canvasElement = <HTMLCanvasElement>document.getElementById("game");

  const save_dir = await resolveSaveData(APP_NAME)(SAVE_DIR);
  const save_path = await path.join(save_dir, SAVE_FILE);
  await state().load(save_path);

  const engine = new ex.Engine({
    width: scale(RESOLUTION.x),
    height: scale(RESOLUTION.y),
    displayMode: ex.DisplayMode.FillScreen,
    antialiasing: false,
    suppressPlayButton: true,
    resolution: {
      width: RESOLUTION.x,
      height: RESOLUTION.y,
    },
    canvasElement,
  });

  const player = await new Player(
    {
      template: toTiledTemplate({
        x: 0,
        y: 0,
        width: 18,
        height: 32,
        name: "Me",
        class: "player",
      }),
      args: { collisionType: ex.CollisionType.Active },
      speed: 100,
    },
    engine
  ).init();

  const doggo = await new Pet(
    toTiledTemplate({
      name: "Lea",
      class: "lea",
      x: player.pos.x,
      y: player.pos.y,
      width: 20,
      height: 16,
    })
  ).init();

  player.adoptPet(doggo);

  const heroes = await new HeroTeam([player], engine).init();
  const equipper = createEquipper(heroes);
  const menus = createMenus(equipper);
  const dialogue = new DialogueMediator(heroes);
  const images = loadImages();
  const loader = new ex.Loader(Object.values(images));
  const fixtures = new FixtureMediator(engine);
  const mediator = new Mediator(engine, heroes, dialogue, menus, fixtures);

  await mediator.start(loader);

  const entity_graphics = new ex.Rectangle({
    height: 20,
    width: 200,
    color: ex.Color.Red,
  });
  const comp = new ex.GraphicsComponent(entity_graphics);
  // const body = new ex.BodyComponent({
  //   type: ex.CollisionType.PreventCollision,
  // });

  const transform = new ex.TransformComponent();

  // console.log({ body });
  transform.pos = ex.vec(110, 110);

  const entity = new ex.Entity([comp, transform], "bob");
  engine.add(entity);
};

document.addEventListener("DOMContentLoaded", main);
