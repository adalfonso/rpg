import * as ex from "excalibur";
import InvalidDataError from "./error/InvalidDataError";
import MissingDataError from "./error/MissingDataError";
import config from "./config";
import manifest from "@img/manifest";
import player_sprite from "@img/player_new.png";
import { BaseTiledTemplate, TiledTemplate } from "./actor/types";
import { TiledObject } from "@excaliburjs/plugin-tiled";
import { fs, path } from "@tauri-apps/api";
import { isRecord } from "./types";

/**
 * Merge two objects together
 *
 * If duplicates are found, favor the second object.
 *
 * NOTE: Merging will remove all references to the original objects by default
 * via JSON stringify/parse. Therefore unserializable objects will produce
 * unexpected behavior.
 *
 * @param obj1              - first object
 * @param obj2              - second object
 * @param preserveReference - preserve reference too non-shallow objects
 *
 * @return merged object
 */
export const merge = (
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>,
  preserveReference = false
): Record<string, unknown> => {
  if (!preserveReference) {
    obj1 = JSON.parse(JSON.stringify(obj1));
    obj2 = JSON.parse(JSON.stringify(obj2));
  }

  for (const p in obj2) {
    try {
      const obj1_p = obj1[p];
      const obj2_p = obj2[p];

      if (isRecord(obj1_p) && isRecord(obj2_p)) {
        obj1[p] = merge(obj1_p, obj2_p, true);
      } else {
        obj1[p] = obj2[p];
      }
    } catch (e) {
      obj1[p] = obj2[p];
    }
  }

  return obj1;
};

/**
 * Retrieve image path from a dot-separated string
 *
 * @param resource - dot-separated string
 *
 * @return image path
 *
 * @throws {MissingDataError} when manifest lookup is missing
 */
export const getImagePath = (resource: string) => {
  const path = resource.split(".").reduce((carry: any, key) => {
    if (!isRecord(carry)) {
      throw new InvalidDataError();
    }

    if (!carry[key]) {
      throw new MissingDataError(`Cannot find image resource "${resource}"`);
    }

    return carry[key];
  }, manifest);

  if (typeof path === "string") {
    return path;
  }

  throw new InvalidDataError(
    `Expected string returned from getImagePath but got ${typeof path} instead`
  );
};

/**
 * Ensure the save dir is created for the app
 *
 * TODO: add error handling
 *
 * @param app_name - name of the application dir
 * @param save_dir - name of th save dir
 */
export const resolveSaveData =
  (app_name: string) => async (save_dir: string) => {
    const data_dir = await fs.readDir("", { dir: fs.Dir.Data });
    const has_app_data =
      data_dir.filter((dir) => dir.name === app_name).length > 0;

    if (!has_app_data) {
      await fs.createDir(await app_name, { dir: fs.Dir.Data });
      await fs.createDir(await path.join(app_name, save_dir), {
        dir: fs.Dir.Data,
      });
    }

    return path.join(await path.dataDir(), app_name, save_dir);
  };

export const loadImages = () => ({
  player: new ex.ImageSource(player_sprite),
});

export const getMapFromName = (name: string) => `/map/${name}.json`;

/**
 * Create a TiledTemplate from a partial config
 *
 * @param partial partial template
 *
 * @returns tiled template
 */
export const toTiledTemplate = (partial: BaseTiledTemplate): TiledTemplate => {
  const id = Math.floor(Math.random() * 999999999999);
  return TiledObject.parse({
    id,
    gid: id,
    point: false,
    properties: [],
    rotation: 0,
    visible: true,
    ...partial,
  } as any) as TiledTemplate;
};

/**
 * Convert degrees to radians
 *
 * @param degrees - angle
 *
 * @returns angle in radians
 */
export const degreesToRadian = (degrees: number) => degrees * (Math.PI / 180);

/**
 * Apply the game scale
 *
 * @param figure - number to scale up
 * @returns scaled figure
 */
export const scale = (figure = 1) => figure * config.scale;
