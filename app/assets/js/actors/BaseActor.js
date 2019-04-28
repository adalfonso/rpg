import config from '../config';
import Vector from "../Vector";

class BaseActor {
    constructor(pos, size) {
        this.pos = pos.times(config.scale);
        this.size = size;
        this.inDialogue;
        this.locked = false;

        this.lastPos = pos.copy();
    }

    update(dt) {

    }

    collidesWith(entity) {
        let collisionPoint = this.collisionPoint();

        let collision = collisionPoint.x > entity.pos.x &&
            collisionPoint.x < entity.pos.x + entity.size.x &&
            collisionPoint.y > entity.pos.y &&
            collisionPoint.y < entity.pos.y + entity.size.y;

        if (collision) {
            return {
                pos: entity.pos.copy(),
                size: entity.size.copy()
            }
        }

        return false;
    }

    collisionPoint(prev = false) {
        return new Vector(
            (prev ? this.lastPos.x : this.pos.x) + this.size.x * .5,
            (prev ? this.lastPos.y : this.pos.y) + this.size.y * .8
        );
    }

    draw(ctx) {
        if (config.debug) {
            this.debugDraw(ctx);
        }

        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y
    }

    debugDraw(ctx) {
        ctx.fillStyle = '#F99';
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }

    resetPos(collision) {
        let prevCollisionPoint = this.collisionPoint(true);

        if (collision) {
            if (prevCollisionPoint.x < collision.pos.x ||
                prevCollisionPoint.x > collision.pos.x + collision.size.x) {
                this.pos.x = this.lastPos.x;
            } else {
                this.pos.y = this.lastPos.y;
            }
        } else {
            this.pos.x = this.lastPos.x;
            this.pos.y = this.lastPos.y
        }
    }

    lock() {
        this.locked = true;
    }

    unlock() {
        if (!this.inDialogue) {
            this.locked = false;
        }
    }
}

export default BaseActor;