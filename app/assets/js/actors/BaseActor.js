import Vector from "../Vector";

class BaseActor {
    constructor(pos, size, offset) {
        this.pos = pos;
        this.size = size;
        this.offset = offset;

        this.lastPos = {
            x: this.pos.x,
            y: this.pos.y
        }
    }

    update(dt) {

    }

    collisionPoint(prev = false) {
        return new Vector(
            (prev ? this.lastPos.x : this.pos.x) + this.size.x * .5,
            (prev ? this.lastPos.y : this.pos.y) + this.size.y * .8
        );
    }

    draw(ctx) {
        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y
    }

    resetPos(collision) {
        let prevCollisionPoint = this.collisionPoint(true);

        if (collision) {
            if (prevCollisionPoint.x < collision.pos.x ||
                prevCollisionPoint.x > collision.pos.x + collision.size.x) {
                this.pos.x = this.lastPos.x;
            } else {
                this.pos.y = this.lastPos.y;
            }
        } else {
            this.pos.x = this.lastPos.x;
            this.pos.y = this.lastPos.y
        }
    }
}

export default BaseActor;