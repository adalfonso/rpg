import Level from './Level';
import InputHandler from  './InputHandler';
import levels from './levels/levels'
import Vector from './Vector';

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.levelNumber = 0;
        this.offset = new Vector(0, 0);

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

        this.offset.x = this.width / 2 - this.level.player.pos.x
        this.offset.y = this.height / 2 - this.level.player.pos.y
    }
}

export default Game;