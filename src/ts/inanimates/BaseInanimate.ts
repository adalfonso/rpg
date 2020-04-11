import Vector from "@/Vector";
import config from "@/config";

export default class BaseInanimate {
  public pos: Vector;
  public size: Vector;

  constructor(pos?: Vector, size?: Vector) {
    this.pos = pos || new Vector(0, 0);
    this.size = size || new Vector(0, 0);
  }

  update(dt: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    if (config.debug) {
      ctx.strokeStyle = "#F00";
      ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
  }
}
