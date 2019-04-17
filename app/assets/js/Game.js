import Level from './Level';
import InputHandler from  './InputHandler';
import levels from './levels/levels'

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.levelNumber = 0;

        let handler = new InputHandler(this);
    }

    loadLevel(event) {
        let match = event.obj.portal_to.match(/^(\d+)\.(\d+)$/);
        let level = levels[parseInt(match[1])][parseInt(match[2])];
        let portal = event.obj;

        this.level.reload(level, portal);
    }

    start() {
        this.level = new Level(levels[0][0]);
    }

    update(dt) {
        let events = this.level.update(dt);

        if (events.length) {
            events.forEach(event => {
                if (event.type = 'enter_portal') {
                    this.loadLevel(event);
                }
            });
        }
    }
}

export default Game;