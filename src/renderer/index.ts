import "./scss/app.scss";
import Display from "@/ui/Display";
import Game from "@/Game";
import Player from "@/actors/Player";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import { resolution } from "@common/common";
import { startAnimation } from "@/util";

document.addEventListener("DOMContentLoaded", async (_event) => {
  const DEFAULT_SAVE_LOCATION = "./data/save_state.json";

  const state: StateManager = StateManager.getInstance();

  await state.load(DEFAULT_SAVE_LOCATION);

  const canvas = <HTMLCanvasElement>document.getElementById("game");
  const player: Player = new Player(new Vector(75, 75), new Vector(36, 64));
  const game: Game = new Game(player);
  const display: Display = new Display(resolution, canvas, game);

  game.start();

  startAnimation((dt) => {
    game.update(dt);
    display.draw();
  });
});
