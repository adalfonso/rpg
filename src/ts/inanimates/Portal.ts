import Inanimate from "./Inanimate";
import Vector from "@/Vector";

class Portal extends Inanimate {
  public pos: Vector;
  public size: Vector;

  public from: string;
  public to: string;

  constructor(pos: Vector, size: Vector, obj) {
    super(pos, size);

    if (!obj.properties) {
      throw "Cannot from from/to when creating portal.";
    }

    obj.properties.forEach((prop) => {
      this[prop.name] = prop.value;
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
  }
}

export default Portal;
