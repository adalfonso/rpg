import config from '../config';
import BaseActor from './BaseActor';
import sprite from '../../img/player.png';
import Renderable from '../Renderable';

class Player extends BaseActor {
    constructor(pos, size) {
        super(pos, size);

        this.speed = { x: 0, y: 0 };
        this.maxSpeed = this.size.x / 22;

        this.direction = 0;

        this.sprites = [
            // img, scale, startFrame, frameCount, framesX, framesY, speed
            new Renderable(sprite, 1, 18, 0, 9, 4, 8),
            new Renderable(sprite, 1, 1, 7, 9, 4, 8),
            new Renderable(sprite, 1, 9, 7, 9, 4, 8),
            new Renderable(sprite, 1, 19, 7, 9, 4, 8),
            new Renderable(sprite, 1, 27, 7, 9, 4, 8)
        ];
    }

    static create(pos, size) {
        return new Player(pos, size);
    }

    get name() {
        return 'player';
    }

    update(time) {
        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;

        super.update();
    }

    draw(ctx) {
        ctx.save();

        if (config.debug) {
            this.debugDraw(ctx);
        }

        ctx.translate(this.pos.x, this.pos.y);

        super.draw(ctx);

        this.sprites[this.direction].draw(ctx);

        ctx.restore();
    }

    debugDraw(ctx) {
        ctx.fillStyle = '#F99';
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
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
        if (!this.speed.x && !this.speed.y) {
           this.direction = 0;

        } else if (this.speed.x > 0) {
            this.direction = 4;

        } else if (this.speed.x < 0) {
            this.direction = 2;

        } else if (this.speed.y > 0) {
            this.direction = 3;

        } else if (this.speed.y < 0) {
            this.direction = 1;
        }
    }
}

export default Player;