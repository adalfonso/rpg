import InvalidDataError from "./error/InvalidDataError";
import MissingDataError from "./error/MissingDataError";
import manifest from "@/_resource/img/manifest";
import { isRecord } from "./types";

/**
 * Lowercase the first character of a string
 *
 * @param input - string to format
 *
 * @return formatted string
 */
export const lcFirst = (input: string): string =>
  input.charAt(0).toLowerCase() + input.slice(1);

/**
 * Uppercase the first character of a string
 *
 * @param input - string to format
 *
 * @return formatted string
 */
export const ucFirst = (input: string): string =>
  input.charAt(0).toUpperCase() + input.slice(1);

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

type AnimationCallback = (dt: number) => void;

/**
 * Create an animation frame loop
 *
 * @param callback - callback to perform on each frame render
 */
export const startAnimation = (callback: AnimationCallback) => {
  let lastTime = 0;

  const frame: FrameRequestCallback = (time: number) => {
    const dt = time - lastTime;
    lastTime = time;

    callback(dt);
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
};

/**
 * Clone an object with JSON stringify/parse method
 *
 * NOTE: Complex objects may not be preserved during string conversion. This
 * should only be used when the object is naturally JSON-like.
 *
 * @param input - input data
 *
 * @return cloned data
 */
export const cloneByStringify = (input: unknown): unknown => {
  return JSON.parse(JSON.stringify(input));
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
      throw new MissingDataError(`Cannot find resource: ${key}`);
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