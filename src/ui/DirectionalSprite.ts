import * as ex from "excalibur";
import { Direction } from "./types";

export enum SpriteOrientation {
  Clockwise = "CLOCKWISE",
}

export interface SpriteConfig {
  size: ex.Vector;
  columns: number;
}

export const getSprites = (
  image: ex.ImageSource,
  config: SpriteConfig,
  orientation: SpriteOrientation = SpriteOrientation.Clockwise
) => {
  if (orientation !== SpriteOrientation.Clockwise) {
    throw new Error(
      `Tried to create MultiSpite with unsupported orientation "${orientation}"`
    );
  }

  const { x: width, y: height } = config.size;
  const directions = [
    Direction.North,
    Direction.East,
    Direction.South,
    Direction.West,
  ];

  return directions.reduce(
    (carry, direction, i) => ({
      ...carry,
      [direction]: new ex.Sprite({
        image,
        sourceView: {
          x: 0,
          y: height * i,
          width,
          height,
        },
      }),
    }),
    {} as Record<Direction, ex.Sprite>
  );
};
