import * as Tiled from "@excaliburjs/plugin-tiled";
import * as ex from "excalibur";
import { Direction, RenderData } from "./types";
import { Constructor } from "@/mixins";

export enum SpriteOrientation {
  Clockwise = "CLOCKWISE",
  Singular = "SINGULAR",
}

export interface SpriteConfig {
  width: number;
  height: number;
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
     * @returns scale used to resize actor
     */
    protected async _setSprites(ui: RenderData, template: Tiled.TiledObject) {
      const { fps, frames, rows, columns, scale, sprite, sprite_orientation } =
        ui;
      const frame_duration = 1000 / fps;
      const image = new ex.ImageSource(sprite);

      await image.load();

      const directions = [
        Direction.North,
        Direction.East,
        Direction.South,
        Direction.West,
        Direction.None,
      ];

      this.sprites = directions.reduce(
        (carry, direction, i) => ({
          ...carry,
          [direction]: ex.Animation.fromSpriteSheet(
            ex.SpriteSheet.fromImageSource({
              image,
              grid: {
                rows,
                columns,
                spriteWidth: template.width,
                spriteHeight: template.height,
              },
              spacing: {
                originOffset: {
                  x: 0,
                  y:
                    sprite_orientation === SpriteOrientation.Clockwise
                      ? template.height * i
                      : 0,
                },
              },
            }),
            // range of frames to render, e.g. [0,1,2,3,4,5]
            [...Array(columns).keys()],
            frame_duration
          ),
        }),
        {} as Record<Direction, ex.Sprite>
      );

      return scale;
    }

    get direction() {
      return this._direction;
    }

    set direction(direction: Direction) {
      this._direction = direction;
    }
  };
