import Game from './Game';
import Display from './Display';
import InputHandler from  './InputHandler';

const GAME_WIDTH: number = 1280;
const GAME_HEIGHT: number = 720;

export let handler: InputHandler = new InputHandler();

let canvas = <HTMLCanvasElement> document.getElementById('game');
let game: Game = new Game(GAME_WIDTH, GAME_HEIGHT);
let display: Display = new Display(canvas, game);
let lastTime: number = 0;

game.start();

function frame(timestamp: number) {
    let dt: number = timestamp - lastTime;
    lastTime = timestamp;

    game.update(dt);
    display.draw(game.offset);

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
