import { SpriteOrientation } from "./MultiSprite";

/**
 * Render info for an actor
 *
 * @prop fps - target framerate
 * @prop rows - number of rows in the spritesheet
 * @prop columns - number of columns in the spritesheet
 * @prop scale - render scale
 * @prop sprite - name ref to sprite image
 * @prop sprite_orientation - graphical order of sprite directions, e.g cardinal directions
 */
export type ActorUiData = {
  fps: number;
  rows: number;
  columns: number;
  scale: number;
  sprite: string;
  sprite_orientation?: SpriteOrientation;
};

/**
 * Data fed to a Renderable instance
 *
 * This is similar to ActorUiData except it has been processed and is a bit
 * easier to work with.
 *
 * @prop fps - target framerate
 * @prop rows - number of rows in the spritesheet
 * @prop columns - number of columns in the spritesheet
 * @prop scale - render scale
 * @prop sprite - loaded spritesheet image
 */
export type RenderData = ActorUiData & {
  sprite_orientation: SpriteOrientation;
};

/**
 * Basic UI data
 *
 * @prop scale     - render scale
 * @prop animation - optional animation
 * @prop sprite    - name ref to sprite image
 */
export type UiData = {
  scale?: number;
  animation?: string;
  sprite: string;
};

export enum Direction {
  None = "0",
  North = "1",
  East = "2",
  South = "3",
  West = "3",
}
