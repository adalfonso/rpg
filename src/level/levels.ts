import sandbox_0 from "../_resource/map/sandbox_0.json";
import sandbox_1 from "../_resource/map/sandbox_1.json";
import sandbox_2 from "../_resource/map/sandbox_2.json";
import { TiledMapOrthogonal } from "tiled-types/types";

const levels = { sandbox_0, sandbox_1, sandbox_2 };

export const base_map_path = "src/_resource/map";
export const getMapFromName = (name: string) => `${base_map_path}/${name}.json`;

export const getLevels = (): Record<string, TiledMapOrthogonal> =>
  levels as unknown as Record<string, TiledMapOrthogonal>;
