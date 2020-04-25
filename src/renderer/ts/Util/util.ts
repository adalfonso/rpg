/**
 * Lowercase the first character of a string
 *
 * @param  {string} input String to format
 *
 * @return {string}       Formatted string
 */
export const lcFirst: Function = (input: string): string =>
  input.charAt(0).toLowerCase() + input.slice(1);

/**
 * Merge two objects together. If duplicates are found, favor the second object.
 *
 * NOTE: Merging will remove all references to the original objects by default
 * via JSON stringify/parse. Therefore unserializable objects will produce
 * unexpected behavior.
 *
 * @param  {object}  obj1              First object
 * @param  {object}  obj2              Second object
 * @param  {boolean} preserveReference Preserve reference too non-shallow objects
 *
 * @return {object}                    Merged object
 */
export const merge: Function = (
  obj1: object,
  obj2: object,
  preserveReference: boolean = false
): object => {
  if (!preserveReference) {
    obj1 = JSON.parse(JSON.stringify(obj1));
    obj2 = JSON.parse(JSON.stringify(obj2));
  }

  for (let p in obj2) {
    try {
      if (obj2[p].constructor == Object) {
        obj1[p] = merge(obj1[p], obj2[p], true);
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
 * Create an animation frame loop
 *
 * @param {Function} callback Callback to perform on each frame render
 */
export const startAnimation: Function = (callback: Function) => {
  let lastTime: number = 0;

  const frame: FrameRequestCallback = (time: number) => {
    let dt: number = time - lastTime;
    lastTime = time;

    callback(dt);
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
};
