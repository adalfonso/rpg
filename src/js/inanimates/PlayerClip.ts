import BaseInanimate from "./BaseInanimate";
import Vector from "../Vector";

export default class PlayerClip extends BaseInanimate {
    public pos: Vector;
    public size: Vector;

    constructor(pos: Vector, size: Vector) {
        super(pos, size);
    }

    draw(ctx: CanvasRenderingContext2D) {
        super.draw(ctx);
    }
}