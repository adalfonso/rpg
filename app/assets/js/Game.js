import Display from './Display';
import Level from './Level';
import InputHandler from  './InputHandler';

import level1 from './levels/level1.json'

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.levelNumber = 0;

        let handler = new InputHandler(this);
    }

    loadLevel(origin = null) {
        this.level = new Level(level1);
        this.display = new Display(this);
    }

    start() {
        this.loadLevel();
    }

    update(dt) {
        this.level.entities.forEach(entity => {
            entity.update(this.ctx, this.level.player);
        });
    }

    draw() {
        this.display.draw();
    }

}

export default Game;