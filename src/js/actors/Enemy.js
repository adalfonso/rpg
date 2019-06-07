import enemies from './enemies.json';
import BaseActor from './BaseActor';
import Vector from '../Vector';
import Dialogue from '../Dialogue';
import Renderable from '../Renderable';

import knight from '../../img/enemies/knight.png';
import Stats from '../Stats';
import { handler } from '../app';

let sprites = {
    knight: knight
};

export default class Enemy extends BaseActor {
    constructor(obj, player) {
        super(
            new Vector(obj.x, obj.y),
            new Vector(obj.width, obj.height)
        );

        let type = obj.properties.filter(
            prop => prop.name === 'type'
        )[0].value;

        let enemy = enemies[type];

        if (!enemy) {
            throw new Error(
                'Enemy data for ' + name +
                ' is not defined in enemies.json'
            );
        }

        this.type = type;
        this.data = enemy;
        this.dialogue = null;
        this.playerRef = player;
        this.stats = new Stats(enemy.default.stats);
        this.defeated = false;

        let sprite = sprites[this.type];

        this.sprites = [
            // img, scale, startFrame, frameCount, framesX, framesY, speed
            new Renderable(sprite, 2, 0, 0, 1, 4, 8),
            new Renderable(sprite, 2, 3, 0, 1, 4, 8),
            new Renderable(sprite, 2, 2, 0, 1, 4, 8),
            new Renderable(sprite, 2, 0, 0, 1, 4, 8),
            new Renderable(sprite, 2, 1, 0, 1, 4, 8)
        ];

        this.direction = 4;
    }

    get dialogueName() {
        return this.data.display_name;
    }

    fight(opponent) {
        handler.trigger(
            'battle', {
                player: this.playerRef,
                enemy: this
            }
        );
    }

    update(dt, player) {
        if (this.collidesWith(this.playerRef) && !this.defeated) {
            this.fight(this.playerRef);
        }
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        this.sprites[this.direction].draw(ctx);

        ctx.restore();
    }
}