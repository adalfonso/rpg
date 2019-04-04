class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(vec) {
        return new Vector(
            this.x + vec.x,
            this.y + vec.y
        );
    }

    minus(vec) {
        return new Vector(
            this.x - vec.x,
            this.y - vec.y
        );
    }

    times(factor) {
        return new Vector(
            this.x * factor,
            this.y * factor
        );
    }
}

export default Vector;