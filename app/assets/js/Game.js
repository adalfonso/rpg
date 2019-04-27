import Level from './Level';
import levels from './levels/levels'
import Vector from './Vector';
import Menu from './menu/BaseMenu';
import Inventory from './menu/Inventory';

class Game {
    constructor(width, height) {
        this.resolution = new Vector(width, height);
        this.resize(width, height);
        this.levelNumber = 0;
        this.offset = new Vector(0, 0);

        this.state = 0;

        this.states = [
            'start-menu',
            'play',
            'pause',
            'inventory'
        ];

        this.menu = new Menu([
            'Press Enter to Start!',
            'Load Saved State (doesn\'t work yet)'
        ]);

        this.inventory = new Inventory([
            'Items',
            'Equip',
            'Special'
        ]);
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
        if (!this.inventory.active && !this.menu.active) {
            this.play();
        }

        if (!this.playing) {
            return;
        }

        let events = this.level.update(dt);

        if (events.length) {
            events.forEach(event => {
                if (event.type = 'enter_portal') {
                    this.loadLevel(event);
                }
            });
        }

        this.offset.x = this.width / 2 - this.level.player.pos.x;
        this.offset.y = this.height / 2 - this.level.player.pos.y;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    play() {
        this.state = 1;
    }

    get playing() {
        return this.states[this.state] === 'play';
    }
}

export default Game;