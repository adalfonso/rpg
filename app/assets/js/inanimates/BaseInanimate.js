import config from '../config';
import Vector from '../Vector';

export default class BaseInanimate {
    constructor(pos, size) {
        this.pos = pos || new Vector(0, 0);
        this.size = size || new Vector(0, 0);
    }

    update(dt, player) {

    }

    draw(ctx) {
        if (config.debug) {
            ctx.strokeStyle = "#F00";
            ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        }
    }

    collidesWith(entity) {
        let collisionPoint = entity.collisionPoint();

        let collision = collisionPoint.x > this.pos.x &&
            collisionPoint.x < this.pos.x + this.size.x &&
            collisionPoint.y > this.pos.y &&
            collisionPoint.y < this.pos.y + this.size.y;

        if (collision) {
            return {
                pos: this.pos.copy(),
                size: this.size.copy()
            }
        }

        return false;
    }
}