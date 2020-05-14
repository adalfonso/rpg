import Renderable from "@/Renderable";
import Vector from "@common/Vector";
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
    let tileSize = r.spriteSize.times(r.scale);

    this.layers.forEach((layer) => {
      layer.data.forEach((value: number, index: number) => {
        r.frame = value - 1;

        let tilePosition = new Vector(
          index % layer.width,
          Math.floor(index / layer.width)
        ).times(tileSize);

        let visible =
          tilePosition.x + offset.x + tileSize.x >= 0 &&
          tilePosition.x + offset.x <= resolution.x &&
          tilePosition.y + offset.y + tileSize.y >= 0 &&
          tilePosition.y + offset.y <= resolution.y;

        // Don't render tiles that aren't visible
        if (!visible) {
          return;
        }

        ctx.translate(tilePosition.x, tilePosition.y);

        r.draw(ctx);

        ctx.translate(-tilePosition.x, -tilePosition.y);
      });
    });
  }
}

export default Map;
