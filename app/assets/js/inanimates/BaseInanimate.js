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
}