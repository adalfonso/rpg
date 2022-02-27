import "./scss/app.scss";
import Display from "@/ui/Display";
import Game from "@/Game";
import HeroTeam from "@/combat/HeroTeam";
import Player from "@/actor/Player";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import config from "@/config";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { resolution } from "@common/common";
import { startAnimation } from "@/util";

document.addEventListener("DOMContentLoaded", async (_event) => {
  const DEFAULT_SAVE_LOCATION = "./data/save_state.json";

  const state: StateManager = StateManager.getInstance();

  await state.load(DEFAULT_SAVE_LOCATION);

  const canvas = <HTMLCanvasElement>document.getElementById("game");
  const player_template = {
    x: 75,
    y: 75,
    height: 18,
    width: 32,
    name: "Me",
    type: "player",
  };
  const player_position = new Vector(player_template.x, player_template.y);
  const player_size = new Vector(player_template.height, player_template.width);
  const player: Player = new Player(
    player_position.times(config.scale),
    player_size.times(config.scale),
    player_template
  );
  const team = new HeroTeam([player]);
  const dialogue = new DialogueMediator(team);
  const game = new Game(team, dialogue);
  const display = new Display(resolution, canvas, game);

  game.start();

  startAnimation((dt: number) => {
    game.update(dt);
    display.draw();
  });
});
