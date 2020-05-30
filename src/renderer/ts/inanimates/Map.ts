import Renderable from "@/Renderable";
import Vector from "@common/Vector";
import config from "@/config";
import { Drawable } from "@/interfaces";

/**
 * A visual representation of the level
 */
class Map implements Drawable {
  /**
   * Rendering asset
   */
  private renderable: Renderable;

  /**
   * Scale of the map
   */
  private scale: number;

  /**
   * Create a new Map instance
   *
   * TODO: Some of the Renderable params should come from a MapTemplate,
   * especially frameCount and gridRatio;
   *
   * @param layers - layer data
   * @param img    - source path for sprite sheet
   */
  constructor(private layers: any[], img: string) {
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
   * @param ctx        - rendering context
   * @param offset     - render position offset
   * @param resolution - render resolution
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

    this.layers.forEach((layer: any) => {
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

        r.draw(ctx, position.plus(offset));
      });
    });
  }
}

export default Map;
