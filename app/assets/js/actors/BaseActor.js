class BaseActor {
    constructor(pos, size) {
        this.pos = pos;
        this.size = size;

        this.lastPos = {
            x: this.pos.x,
            y: this.pos.y
        }
    }

    update(dt) {
    }

    draw(ctx) {
        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y
    }

    resetPos() {
        this.pos.x = this.lastPos.x;
        this.pos.y = this.lastPos.y
    }
}

export default BaseActor;