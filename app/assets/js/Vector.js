export default class Vector {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    times(mult) {
        return new Vector(this.x * mult, this.y * mult);
    }
}