import Game from "./Game";
import Display from "./Display";
import EventBus from "./EventBus";
import Vector from "./Vector";
import { startAnimation } from "./util";

export let bus: EventBus = new EventBus();

const GAME_WIDTH: number = 1280;
const GAME_HEIGHT: number = 720;
const RESOLUTION = new Vector(GAME_WIDTH, GAME_HEIGHT);

let canvas = <HTMLCanvasElement>document.getElementById("game");

let game: Game = new Game();
let display: Display = new Display(RESOLUTION, canvas, game);

game.start();

startAnimation((dt) => {
  game.update(dt);
  display.draw();
});
