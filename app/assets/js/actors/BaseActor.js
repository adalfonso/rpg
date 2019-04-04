import Vector from '../Vector.js';

class BaseActor {
    constructor(pos, size) {
        this.pos = pos;
        this.size = size;
        this.velocity = new Vector(0, 0);
    }

    static create(pos, size) {
        return new BaseActor(pos);
    }

    collidesWith(actor) {
        let c1 = this.corners();
        let c2 = actor.corners();

        return c1.x2 > c2.x1 &&
            c1.x1 < c2.x2 &&
            c1.y2 > c2.y1 &&
            c1.y1 < c2.y2;
    }

    corners() {
        return {
            x1: Math.floor(this.pos.x),
            x2: Math.ceil(this.pos.x + this.size.x),
            y1: Math.floor(this.pos.y),
            y2: Math.ceil(this.pos.y + this.size.y)
        }
    }
}

export default BaseActor;