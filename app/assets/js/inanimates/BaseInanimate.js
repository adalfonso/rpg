import config from '../config';

export default class BaseInanimate {
    constructor(pos, size) {
        this.pos = pos || { x: 0, y: 0 };
        this.size = size || { x: 0, y: 0 };
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