import Renderable from "@/Renderable";
import Vector from "../Vector";
import config from "@/config";

/**
 * Map is an underlying visual component and has no moving parts. It is simply
 * the basis to render and build additional fixures atop.
 */
class Map {
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
   * @param {CanvasRenderingContext2D} ctx Rendering context
   */
  public draw(ctx: CanvasRenderingContext2D) {
    if (!this.renderable.ready) {
      return;
    }

    let r = this.renderable;

    this.layers.forEach((layer) => {
      layer.data.forEach((value: number, index: number) => {
        r.frame = value - 1;

        let tile = new Vector(
          index % layer.width,
          Math.floor(index / layer.width)
        );

        ctx.save();
        ctx.translate(...tile.times(r.spriteSize).times(r.scale).toArray());
        r.draw(ctx);
        ctx.restore();
      });
    });
  }
}

export default Map;
