import Inanimate from "./Inanimate";
import Vector from "@/Vector";

export default class Clip extends Inanimate {
  public pos: Vector;
  public size: Vector;

  constructor(pos: Vector, size: Vector) {
    super(pos, size);
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
  }
}
