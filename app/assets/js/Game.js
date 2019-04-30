import Level from './Level';
import levels from './levels/levels'
import Vector from './Vector';
import StartMenu from './menu/StartMenu';
import Inventory from './menu/Inventory';
import Weapon from './item/Weapon';
import Battle from './Battle';

class Game {
    constructor(width, height) {
        this.resolution = new Vector(width, height);
        this.battle = null;
        this.resize(width, height);
        this.levelNumber = 0;
        this.offset = new Vector(0, 0);

        this.state = 0;

        this.states = [
            'start-menu',
            'play',
            'pause',
            'inventory',
            'battle'
        ];

        this.menu = new StartMenu([{
            type: 'start',
            description: 'Press Enter to Start!',
            action: menu => { menu.active = false }
        }, {
            type: 'load',
            description: 'Load Saved State (doesn\'t work yet)',
            action: menu => {}
        }]);

        this.inventory = new Inventory(
            [{
                type: 'item',
                description: 'Items',
                data: []
            }, {
                type: 'equipable',
                description: 'Equipment',
                data: []
            }, {
                type: 'special',
                description: 'Special',
                data: []
            }]
        );

        this.inventory.store(new Weapon({
            name: 'Basic Sword',
            description: 'A basic bitch sword.',
            attack: 3
        }));

        this.inventory.store(new Weapon({
            name: 'Mace',
            description: 'A fucking mace. Watch out!',
            attack: 10
        }));

        this.inventory.store(new Weapon({
            name: 'Pole Arm',
            description: 'Swift and strong.',
            attack: 5
        }));

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
            this.lock(0);

        } else if (this.inventory.active) {
            this.lock(3);

        } else if (this.battle && this.battle.active) {
            this.battle.update(dt);
        } else {
            this.unlock();
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
        this.state = 1;
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

    get playing() {
        return this.states[this.state] === 'play';
    }
}

export default Game;