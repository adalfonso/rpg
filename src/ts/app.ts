import Game from "./Game";
import Display from "./Display";
import EventBus from "./EventBus";
import Vector from "./Vector";
import { startAnimation } from "./util";
import Player from "./actors/Player";

export const bus: EventBus = new EventBus();
export const player: Player = new Player(
  new Vector(75, 75),
  new Vector(36, 64)
);

const GAME_WIDTH: number = 1280;
const GAME_HEIGHT: number = 720;
const RESOLUTION = new Vector(GAME_WIDTH, GAME_HEIGHT);

let canvas = <HTMLCanvasElement>document.getElementById("game");

let game: Game = new Game(player);
let display: Display = new Display(RESOLUTION, canvas, game);

game.start();

startAnimation((dt) => {
  game.update(dt);
  display.draw();
});
