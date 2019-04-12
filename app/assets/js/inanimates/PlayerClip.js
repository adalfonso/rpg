import BaseInanimate from "./BaseInanimate";

export default class PlayerClip extends BaseInanimate {
    constructor(pos, size) {
        super(pos, size);
    }

    collidesWith(entity) {
        let x = entity.pos.x + entity.size.x / 2;
        let y = entity.pos.y + entity.size.y / 2;

        return x > this.pos.x &&
            x < this.pos.x + this.size.x &&
            y > this.pos.y &&
            y < this.pos.y + this.size.y;
    }

    draw(ctx) {
        // ctx.strokeStyle = "#F00";
        // ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}