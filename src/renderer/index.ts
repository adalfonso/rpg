import Display from "@/ui/Display";
import Game from "@/Game";
import Player from "@/actors/Player";
import Vector from "@common/Vector";
import { RESOLUTION } from "@common/common";
import { startAnimation } from "@/Util/util";

document.addEventListener("DOMContentLoaded", function (_event) {
  const player: Player = new Player(new Vector(75, 75), new Vector(36, 64));

  let canvas = <HTMLCanvasElement>document.getElementById("game");

  let game: Game = new Game(player);
  let display: Display = new Display(RESOLUTION, canvas, game);

  game.start();

  startAnimation((dt) => {
    game.update(dt);
    display.draw();
  });
});
