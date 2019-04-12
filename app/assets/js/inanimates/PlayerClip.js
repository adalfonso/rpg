import BaseInanimate from "./BaseInanimate";

export default class PlayerClip extends BaseInanimate {
    constructor(pos, size) {
        super(pos, size);
    }

    collidesWith(entity) {
        let xRatio = entity.pos.x < this.pos.x ? .6 : .4;
        let x = entity.pos.x + entity.size.x  * xRatio;
        let y = entity.pos.y + entity.size.y * .8;

        return x > this.pos.x &&
            x < this.pos.x + this.size.x &&
            y > this.pos.y &&
            y < this.pos.y + this.size.y;
    }

    draw(ctx) {
        super.draw(ctx);
    }
}