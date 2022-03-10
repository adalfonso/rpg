import "./_resource/css/app.less";
import Display from "@/ui/Display";
import Game from "@/Game";
import Player from "@/actor/Player";
import Vector from "@common/Vector";
import config from "@/config";
import { DEFAULT_SAVE_LOCATION } from "./constants";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { HeroTeam } from "@/combat/HeroTeam";
import { Pet } from "./actor/Pet";
import { inDev } from "@common/helpers";
import { resolution } from "@common/common";
import { startAnimation } from "@/util";
import { state } from "@/state/StateManager";

document.addEventListener("DOMContentLoaded", async (_event) => {
  await state().load(DEFAULT_SAVE_LOCATION);

  const canvas = <HTMLCanvasElement>document.getElementById("game");
  const player_template = {
    x: 75,
    y: 75,
    width: 18,
    height: 32,
    name: "Me",
    type: "player",
  };
  const player_position = new Vector(player_template.x, player_template.y);
  const player_size = new Vector(player_template.width, player_template.height);
  const player = new Player(
    player_position.times(config.scale),
    player_size.times(config.scale),
    player_template
  );
  const doggo = new Pet(player.position.copy(), player.size.copy(), {
    name: "Lea",
    type: "lea",
    x: 0,
    y: 0,
    width: 16,
    height: 32,
  });
  player.adoptPet(doggo);

  const team = new HeroTeam([player]);
  const dialogue = new DialogueMediator(team);
  const game = new Game(team, dialogue);
  const display = new Display(resolution, canvas, game);

  startAnimation((dt: number) => {
    game.update(dt);
    display.draw();
  });
});

// Hot module replacement
if (inDev() && module.hot) module.hot.accept();
