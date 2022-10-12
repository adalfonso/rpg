import Renderable from "@/ui/Renderable";
import { Vector } from "excalibur";
import config from "@/config";
import { Drawable } from "@/interfaces";
import { TiledLayerTilelayer } from "tiled-types/types";

/** A visual representation of the level */
class Map implements Drawable {
  /** Rendering asset */
  private renderable: Renderable;

  /** Scale of the map */
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
  constructor(private layers: TiledLayerTilelayer[], img: string) {
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

    const r = this.renderable;
    const size = r.spriteSize.scale(r.scale);

    this.layers.forEach((layer) => {
      if (typeof layer.data === "string") {
        console.error(
          'Detected string "data" when reading tile layer; Expected number[]'
        );
        return;
      }

      layer.data.forEach((value: number, index: number) => {
        r.frame = value - 1;

        const position = new Vector(
          index % layer.width,
          Math.floor(index / layer.width)
        ).scale(size);

        const visible =
          position.x + offset.x + size.x >= 0 &&
          position.x + offset.x <= resolution.x &&
          position.y + offset.y + size.y >= 0 &&
          position.y + offset.y <= resolution.y;

        // Don't render tiles that aren't visible
        if (!visible) {
          return;
        }

        r.draw(ctx, position.add(offset));
      });
    });
  }
}

export default Map;
