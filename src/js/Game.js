import Level from './Level';
import levels from './levels/levels'
import Vector from './Vector';
import StartMenu from './menu/StartMenu';
import Battle from './Battle';

class Game {
    constructor(width, height) {
        this.resolution = new Vector(width, height);
        this.resize(width, height);
        this.levelNumber = 0;
        this.offset = new Vector(0, 0);

        this.battle = null;
        this.state = 'start-menu';

        this.states = [
            'start-menu',
            'play',
            'pause',
            'inventory',
            'battle'
        ];

        this.menu = new StartMenu();

        _handler.register(this);
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
        if (this.menu.active) {
            this.lock('start-menu');

        } else if (this.level.player.inventory.active) {
            this.lock('inventory');

        } else if (this.battle) {
            if (this.battle.active) {
                this.battle.update(dt);

            } else {
                this.battle = null;
            }
        } else {
            this.unlock();
        }

        if (this.state !== 'playing') {
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

        if (this.battle && this.battle.active) {
            this.offset.x = 0;
            this.offset.y = 0;
        } else {
            this.offset.x = this.width / 2 - this.level.player.pos.x;
            this.offset.y = this.height / 2 - this.level.player.pos.y;
        }
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    lock(state) {
        this.state = state;
        this.level.player.lock();
    }

    unlock() {
        this.level.player.unlock();
        this.state = 'playing';
    }

    register() {
        return {
            battle: e => {
                if (this.battle) {
                    return;
                }

                this.battle = new Battle(
                    e.detail.player,
                    e.detail.enemy
                );
            }
        }
    }
}

export default Game;