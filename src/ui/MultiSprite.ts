import * as ex from "excalibur";
import MissingDataError from "@/error/MissingDataError";
import { Constructor } from "@/mixins";
import { Direction, RenderData } from "./types";
import { Nullable } from "@/types";
import { TiledTemplate } from "@/actor/types";

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
    protected _sprites: Nullable<Record<Direction, ex.Graphic>> = null;

    /** Saved direction to restore to later on */
    protected _saved_direction: Nullable<Direction> = null;

    /** Save the direction of an actor */
    public saveDirection() {
      this._saved_direction = this.direction;
    }

    /** Restore the direction of Actor */
    public restoreDirection() {
      if (this._saved_direction === null) {
        throw new MissingDataError(
          "Tried to restore direction but saved direction was null"
        );
      }

      this.direction = this._saved_direction;
      this._saved_direction = null;
    }

    /**
     * Set initial sprite from UI data
     *
     * @param ui - UI date
     * @param getStartFrames - fn that determines starting frame per direction
     */
    protected async _setSprites(ui: RenderData, template: TiledTemplate) {
      const { fps, rows, columns, scale, sprite, sprite_orientation } = ui;
      const frame_duration = 1000 / fps;

      const image = new ex.ImageSource(sprite);

      try {
        await image.load();
      } catch (e) {
        console.error(
          `Failed to load image when setting sprites for MultiSprite`
        );
      }

      const directions = [
        Direction.North,
        Direction.East,
        Direction.South,
        Direction.West,
        Direction.None,
      ];

      this._sprites = directions.reduce(
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

      Object.values(this._sprites).forEach((sprite) => {
        sprite.scale = ex.vec(scale, scale);
      });
    }

    get direction() {
      if (this._sprites === null) {
        return Direction.None;
      }

      const sprites = Object.entries(this._sprites).filter(([_, animation]) =>
        // Check all current graphics to see if animation is included
        this.graphics.current.map((g) => g.graphic).includes(animation)
      );

      if (sprites.length === 0) {
        console.warn(
          "Tried to save Actor direction but could not find the direction"
        );
        return Direction.None;
      }

      return sprites[0][0] as Direction;
    }

    set direction(direction: Direction) {
      if (this._sprites === null) {
        console.warn(
          `Tried to set direction of MultiSprite but _sprites is null`
        );

        return;
      }

      this.graphics.use(this._sprites[direction]);
    }
  };
