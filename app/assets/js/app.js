import Game from './Game.js';
import Display from './Display';

let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');

const GAME_WIDTH = 800 - 32;
const GAME_HEIGHT = 800 - 32;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);
let display = new Display(canvas, game);

game.start();

let lastTime = 0;

function frame(timestamp) {
    let dt = timestamp - lastTime;
    lastTime = timestamp;

    game.update(dt);
    display.draw(ctx);

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
