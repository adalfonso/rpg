import BaseInanimate from "./BaseInanimate";
import Vector from "@/Vector";

export default class Portal extends BaseInanimate {
  public pos: Vector;
  public size: Vector;

  constructor(pos: Vector, size: Vector, obj) {
    super(pos, size);

    if (obj && obj.properties) {
      obj.properties.forEach((prop) => {
        this[prop.name] = prop.value;
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
  }
}
