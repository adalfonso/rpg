import Game from './Game.js';
import Display from './Display';
import InputHandler from  './InputHandler';

declare global {
    interface WindowInterface extends Window {
        _handler: any;
    }
}

(window as WindowInterface)._handler = new InputHandler();

let canvas = <HTMLCanvasElement> document.getElementById('game');

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);
let display = new Display(canvas, game);

game.start();

let lastTime = 0;

function frame(timestamp) {
    let dt = timestamp - lastTime;
    lastTime = timestamp;

    game.update(dt);
    display.draw(game.offset);

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
