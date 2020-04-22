import "./scss/app.scss";
import Display from "@/ui/Display";
import Game from "@/Game";
import Player from "@/actors/Player";
import Vector from "@common/Vector";
import { resolution } from "@common/common";
import { startAnimation } from "@/Util/util";

if (module.hot) {
  module.hot.accept();
}

document.addEventListener("DOMContentLoaded", function (_event) {
  const player: Player = new Player(new Vector(75, 75), new Vector(36, 64));

  let canvas = <HTMLCanvasElement>document.getElementById("game");

  let game: Game = new Game(player);
  let display: Display = new Display(resolution, canvas, game);

  game.start();

  startAnimation((dt) => {
    game.update(dt);
    display.draw();
  });
});
