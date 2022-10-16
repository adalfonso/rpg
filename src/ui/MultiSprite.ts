import * as Tiled from "@excaliburjs/plugin-tiled";
import * as ex from "excalibur";
import { Direction, RenderData } from "./types";
import { Constructor } from "@/mixins";

export enum SpriteOrientation {
  Clockwise = "CLOCKWISE",
  Singular = "SINGULAR",
}

export interface SpriteConfig {
  size: ex.Vector;
  columns: number;
  orientation: SpriteOrientation;
}

export const MultiSprite = <T extends Constructor>(Base: T) =>
  /** An entity that renders a series of sprites */
  class MultiSprite extends Base {
    /** List of all entity's sprites */
    protected sprites: Record<Direction, ex.Graphic> = {};

    /** Direction entity is facing */
    protected _direction: Direction = Direction.None;

    /**
     * Set initial sprite from UI data
     *
     * @param ui - UI date
     * @param getStartFrames - fn that determines starting frame per direction
     */
    protected async _setSprites(ui: RenderData, template: Tiled.TiledObject) {
      const { fps, frames, rows, columns, scale, sprite, sprite_orientation } =
        ui;
      const image = new ex.ImageSource(sprite);

      await image.load();

      this.sprites = getSprites(image, {
        size: ex.vec(this._template.width, this._template.height),
        columns,
        orientation: sprite_orientation,
      });
    }

    get direction() {
      return this._direction;
    }

    set direction(direction: Direction) {
      this._direction = direction;
    }
  };

/**
 * Get sprites for an image and configuration
 *
 * @param image - image source
 * @param config - rendering config
 * @param orientation - orientation for various sprite directions
 *
 * @returns map of cardinal directions to sprites
 */
const getSprites = (image: ex.ImageSource, config: SpriteConfig) => {
  const { x: width, y: height } = config.size;
  const directions = [
    Direction.North,
    Direction.East,
    Direction.South,
    Direction.West,
    Direction.None,
  ];

  return directions.reduce(
    (carry, direction, i) => ({
      ...carry,
      [direction]: new ex.Sprite({
        image,
        sourceView: {
          x: 0,
          y:
            config.orientation === SpriteOrientation.Clockwise ? height * i : 0,
          width,
          height,
        },
      }),
    }),
    {} as Record<Direction, ex.Sprite>
  );
};
