import State from './State.js';
import Display from './Display.js';
import Level from './Level.js';

import levels from './levels.js';
import Vector from './Vector.js';

class Game {
    constructor() {
        this.levelNumber = 0;
        this.loadLevel();

        document.addEventListener('keydown', e => {
            if (!e.key.match(/Arrow/)) {
                return;
            }

            let player = this.state.player;
            let movesTo = player.moveTo(e.key);
            let touches = this.level.touches(movesTo, player.size, 'wall');

            if (!touches) {
                player.move(e.key);
            }

            if (this.level.touches(movesTo, player.size, 'portal-next')) {
                this.loadLevel('next');
            } else if (this.level.touches(movesTo, player.size, 'portal-previous')) {
                this.loadLevel('previous');
            }
        });
    }

    loadLevel(origin = null) {
        let config = {};

        if (origin) {
            let charName = 'portal-' + origin;

            let collision = this.level.portalCollisionIndex(charName, this.state.player);

            config.origin = {
                charName: charName,
                collision: collision
            };

            this.levelNumber += origin === 'previous' ? -1 : 1;
        }

        this.level = new Level(levels[this.levelNumber], config);

        if (this.display) {
            this.display.clear();
        }

        let resources = this.level.getRows();

        this.state = new State(resources);
        this.display = new Display(this.state);

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
        this.state.update(time, this.level);
        this.display.sync(this.state);

        return true;
    }

}

export default Game;