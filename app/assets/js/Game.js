import State from './State.js';
import Display from './Display.js';
import Level from './Level.js';

import { level1 } from './levels.js';

class Game {
    constructor() {
        this.level = new Level(level1);
        let resources = this.level.getRows();

        this.state = new State(resources);
        this.display = new Display(resources);

        this.display.drawGrid();
        this.display.drawActors();
    }

    start() {
        let lastTime = null;

        function frame(time) {
            if (lastTime !== null) {
                let timeStep = Math.min(time - lastTime, 100) / 1000;

                if (!this.refresh(timeStep)) {
                    return;
                }
            }

            lastTime = time;
            requestAnimationFrame(frame.bind(this));
        }

        requestAnimationFrame(frame.bind(this));
    }

    refresh(time) {
        this.state.update(time, 'state');
        this.display.sync(this.state);

        return true;
    };
}

export default Game;