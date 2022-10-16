import { SpriteOrientation } from "./MultiSprite";

/**
 * Render info for an actor
 *
 * @prop fps    - target framerate
 * @prop frames - detailed info on how spritesheet works
 * @prop scale  - render scale
 * @prop sprite - name ref to sprite image
 */
export type ActorUiData = {
  fps: number;
  frames: FrameRenderTemplate;
  scale: number;
  sprite: string;
  rows: number;
  columns: number;
  sprite_orientation?: SpriteOrientation;
};

/**
 * Data fed to a Renderable instance
 *
 * This is similar to ActorUiData except it has been processed and is a bit
 * easier to work with.
 *
 * @prop fps    - target framerate
 * @prop frames - detailed info on how spritesheet works
 * @prop ratio  - x/y dimensions of spritesheet
 * @prop scale  - render scale
 * @prop sprite - loaded spritesheet image
 */
export type RenderData = {
  fps: number;
  frames: FrameRenderTemplate;
  columns: number;
  rows: number;
  scale: number;
  sprite: string;
  sprite_orientation: SpriteOrientation;
};

/**
 * Detailed info on how an actor's spritesheet works
 *
 * @prop x     - number of frames on the x-axis
 * @prop y     - number of frames on the y-axis
 * @prop idle  - number of frames in the idle sequence
 * @prop north - number of frames in the north facing sequence
 * @prop east  - number of frames in the east facing sequence
 * @prop south - number of frames in the south facing sequence
 * @prop west  - number of frames in the west facing sequence
 */
export type FrameRenderTemplate = {
  x: number;
  y: number;
  idle: number;
  north: number;
  east: number;
  south: number;
  west: number;
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
  None,
  North,
  East,
  South,
  West,
}
