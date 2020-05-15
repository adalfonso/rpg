import Renderable from "@/Renderable";
import Vector from "@common/Vector";
import config from "@/config";
import { Drawable } from "@/interfaces";

/**
 * Map is an underlying visual component and has no moving parts. It is simply
 * the basis to render and build additional fixures atop.
 */
class Map implements Drawable {
  /**
   * Layer data
   *
   * @prop {object} layers
   */
  private layers: any;

  /**
   * Rendering asset
   *
   * @prop {Renderable} renderable
   */
  private renderable: Renderable;

  /**
   * Scale of the map
   *
   * @prop {number} scale
   */
  private scale: number;

  /**
   * Create a new Map instance
   *
   * TODO: Some of the Renderable params should come from a MapTemplate,
   * especially frameCount and gridRatio;
   *
   * @param {object} layers Layer data
   * @param {string} img    Source path for sprite sheet
   */
  constructor(layers: object, img: string) {
    this.layers = layers;

    this.scale = config.scale;

    this.renderable = new Renderable(
      img,
      this.scale,
      0,
      256,
      new Vector(16, 16),
      0
    );
  }

  /**
   * Draw all tiles through a renderable
   *
   * @param {CanvasRenderingContext2D} ctx        Rendering context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    if (!this.renderable.ready) {
      return;
    }

    let r = this.renderable;
    let size = r.spriteSize.times(r.scale);

    this.layers.forEach((layer) => {
      layer.data.forEach((value: number, index: number) => {
        r.frame = value - 1;

        let position = new Vector(
          index % layer.width,
          Math.floor(index / layer.width)
        ).times(size);

        let visible =
          position.x + offset.x + size.x >= 0 &&
          position.x + offset.x <= resolution.x &&
          position.y + offset.y + size.y >= 0 &&
          position.y + offset.y <= resolution.y;

        // Don't render tiles that aren't visible
        if (!visible) {
          return;
        }

        /**
         * Offset is not used when drawing because the canvas is already
         * translated at this point. The offset is still passed in as a
         * parameter because it's used to determine if the tile is off screen.
         *
         * This may be bad practice because it's not obvious that the offset
         * would not be utilized by this class.
         */
        r.draw(ctx, position);
      });
    });
  }
}

export default Map;
