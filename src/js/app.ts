import Game from './Game';
import Display from './Display';
import InputHandler from  './InputHandler';

export let handler = new InputHandler();

let canvas = <HTMLCanvasElement> document.getElementById('game');

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);
let display = new Display(canvas, game);

game.start();

let lastTime: number = 0;

function frame(timestamp: number) {
    let dt = timestamp - lastTime;
    lastTime = timestamp;

    game.update(dt);
    display.draw(game.offset);

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
