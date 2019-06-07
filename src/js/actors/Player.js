import BaseActor from './BaseActor';
import sprite from '../../img/player-new.png';
import Renderable from '../Renderable';
import Inventory from '../menu/Inventory';
import Weapon from '../item/Weapon';
import Vector from '../Vector';
import Stats from '../Stats';
import { handler } from '../app';

class Player extends BaseActor {
    constructor(pos, size) {
        super(pos, size);

        this.speed = new Vector(0, 0);
        this.maxSpeed = size.x / 10;
        this.direction = 0;

        this.sprites = [
            // img, scale, startFrame, frameCount, framesX, framesY, speed
            // new Renderable(sprite, 1, 18, 0, 9, 4, 8),
            // new Renderable(sprite, 1, 1, 7, 9, 4, 8),
            // new Renderable(sprite, 1, 9, 7, 9, 4, 8),
            // new Renderable(sprite, 1, 19, 7, 9, 4, 8),
            // new Renderable(sprite, 1, 27, 7, 9, 4, 8)
            new Renderable(sprite, 2, 0, 0, 1, 4, 8),
            new Renderable(sprite, 2, 3, 0, 1, 4, 8),
            new Renderable(sprite, 2, 2, 0, 1, 4, 8),
            new Renderable(sprite, 2, 0, 0, 1, 4, 8),
            new Renderable(sprite, 2, 1, 0, 1, 4, 8)
        ];

        this.stats = new Stats({
            hp: 10,
            atk: 2,
            def: 0,
            sp_atk: 0,
            sp_def: 0,
            spd: 1
        });

        this.inventory = new Inventory();

        this.weapon = null;
        this.spells = [];

        handler.register(this);

        // Testing
        this.init();
    }

    get name() {
        return 'player';
    }

    get dialogueName() {
        return 'Me';
    }

    update(time) {
        if (this.locked) {
            return;
        }

        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;

        super.update();
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        this.sprites[this.direction].draw(ctx);

        ctx.restore();
    }

    move(key) {
        switch(key) {
            case 'ArrowLeft':
                this.speed.x = -this.maxSpeed;
                break;

            case 'ArrowDown':
                this.speed.y = this.maxSpeed;
                break;

            case 'ArrowRight':
                this.speed.x = this.maxSpeed;
                break;

            case 'ArrowUp':
                this.speed.y = -this.maxSpeed;
                break;
        }

        this.changeDirection();
    }

    stop(key) {
        if (key === 'ArrowLeft' && this.speed.x < 0) {
            this.speed.x = 0;
        }

        if (key === 'ArrowRight' && this.speed.x > 0) {
            this.speed.x = 0;
        }

        if (key === 'ArrowUp' && this.speed.y < 0) {
            this.speed.y = 0;
        }

        if (key === 'ArrowDown' && this.speed.y > 0) {
            this.speed.y = 0;
        }

        this.changeDirection();
    }

    changeDirection() {
        if (this.locked) {
            return;
        }

        if (this.speed.x > 0) {
            this.direction = 4;

        } else if (this.speed.x < 0) {
            this.direction = 2;

        } else if (this.speed.y > 0) {
            this.direction = 3;

        } else if (this.speed.y < 0) {
            this.direction = 1;
        }
    }

    register() {
        return {
            keydown: e => {
                if (e.key.match(/Arrow/)) {
                    this.move(e.key);
                }
            },

            keyup: e =>{
                if (e.key.match(/Arrow/)) {
                    this.stop(e.key);
                }
            },
        }
    }

    init() {
        this.inventory.store(new Weapon({
            name: 'Basic Sword',
            description: 'A basic bish sword.',
            damage: 3
        }));

        this.inventory.store(new Weapon({
            name: 'Mace',
            description: 'An effing mace. Watch out!',
            damage: 10
        }));

        this.inventory.store(new Weapon({
            name: 'Pole Arm',
            description: 'Swift and strong.',
            damage: 5
        }));

        this.weapon = new Weapon({
            name: 'Basic Sword',
            description: 'A basic bish sword.',
            damage: 1
        });
    }
}

export default Player;