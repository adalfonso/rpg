import "./scss/app.scss";
import Display from "@/ui/Display";
import Game from "@/Game";
import Player from "@/actor/Player";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import config from "@/config";
import { DEFAULT_SAVE_LOCATION } from "./constants";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { HeroTeam } from "@/combat/HeroTeam";
import { resolution } from "@common/common";
import { startAnimation } from "@/util";

document.addEventListener("DOMContentLoaded", async (_event) => {
  const state: StateManager = StateManager.getInstance();

  await state.load(DEFAULT_SAVE_LOCATION);

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
  const player: Player = new Player(
    player_position.times(config.scale),
    player_size.times(config.scale),
    player_template
  );
  const team = new HeroTeam([player]);
  const dialogue = new DialogueMediator(team);
  const game = new Game(team, dialogue);
  const display = new Display(resolution, canvas, game);

  startAnimation((dt: number) => {
    game.update(dt);
    display.draw();
  });
});
