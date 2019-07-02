export default class Vector {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    copy(): Vector {
        return new Vector(this.x, this.y);
    }

    times(mult: number): Vector {
        return new Vector(this.x * mult, this.y * mult);
    }
}