import Game from './Game.js';

let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);
game.start();

let lastTime = 0;

function frame(timestamp) {
    let dt = timestamp - lastTime;
    lastTime = timestamp;

    game.update(dt);
    game.draw(ctx);

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
