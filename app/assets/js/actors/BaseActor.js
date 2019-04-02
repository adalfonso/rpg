import { domify } from './../helpers.js';

class BaseActor {
    constructor(pos) {
        this.pos = pos;
    }

    static create(pos) {
        return new BaseActor(pos);
    }
}

export default BaseActor;