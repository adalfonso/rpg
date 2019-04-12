export default class BaseInanimate {
    constructor(pos, size) {
        this.pos = pos || { x: 0, y: 0 };
        this.size = size || { x: 0, y: 0 };
    }

    update(dt, player) {

    }

    draw(ctx) {
        ctx.fillStyle = this.fillStyle;

        ctx.fillRect(
            this.pos.x,
            this.pos.y,
            this.size.x,
            this.size.y
        );
    }
}