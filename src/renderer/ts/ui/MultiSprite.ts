import Renderable from "./Renderable";
import { CardinalInitFrame, Direction, RenderData } from "./types";
import { Constructor } from "@/mixins";

export const getCardinalStartFrames = (ui: RenderData): CardinalInitFrame => ({
  none: 2 * ui.frames.x,
  north: 0,
  east: 1 * ui.frames.x,
  south: 2 * ui.frames.x,
  west: 3 * ui.frames.x,
});

export const MultiSprite = <T extends Constructor>(Base: T) =>
  /** An entity that renders a series of sprites */
  class MultiSprite extends Base {
    /** List of all entity's sprites */
    protected _sprites: Renderable;

    /** Direction entity is facing */
    protected _direction: Direction;

    /**
     * Set initial sprite from UI data
     *
     * @param ui - UI date
     * @param getStartFrames - fn that determines starting frame per direction
     */
    protected _setSprites(
      ui: RenderData,
      getStartFrames: (
        ui: RenderData
      ) => CardinalInitFrame = getCardinalStartFrames
    ) {
      const { fps, frames, ratio, scale, sprite } = ui;
      const { none, north, east, south, west } = getStartFrames(ui);

      this.sprites = [
        // img, scale, startFrame, frameCount, framesX, framesY, speed
        new Renderable(sprite, scale, none, frames.idle, ratio, fps),
        new Renderable(sprite, scale, north, frames.north, ratio, fps),
        new Renderable(sprite, scale, east, frames.east, ratio, fps),
        new Renderable(sprite, scale, south, frames.south, ratio, fps),
        new Renderable(sprite, scale, west, frames.west, ratio, fps),
      ];
    }

    get direction() {
      return this._direction;
    }

    set direction(direction: Direction) {
      this._direction = direction;
    }
  };
