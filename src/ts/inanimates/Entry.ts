import Inanimate from "./Inanimate";
import Vector from "@/Vector";

class Entry extends Inanimate {
  public pos: Vector;
  public size: Vector;

  private name: string;

  constructor(pos: Vector, size: Vector, obj) {
    super(pos, size);

    this.name = obj.name;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
  }
}

export default Entry;
