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

    travelDistance() {
        return new Vector(0, 0);
    }
}

export default BaseActor;