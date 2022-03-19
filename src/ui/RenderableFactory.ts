import MissingDataError from "@/error/MissingDataError";
import Renderable from "./Renderable";
import Vector from "@/physics/math/Vector";
import { getImagePath } from "@/util";

/** Generate a new renderable */
class RenderableFactory {
  /**
   * Create a new Renderable
   *
   * @param path - referenec to image path
   *
   * @return the renderable
   *
   * @throws {MissingDataError} if the image path can't be found
   */
  public static createRenderable(path: string): Renderable {
    try {
      const image = getImagePath(path);
      const scale = 1;
      const ratio = new Vector(1, 1);
      const fps = 1;

      return new Renderable(image, scale, 0, 0, ratio, fps);
    } catch (e) {
      throw new MissingDataError(
        `Unable to find ui.sprite "${path}" in template when loading ${this.constructor.name}.`
      );
    }
  }
}

export default RenderableFactory;
