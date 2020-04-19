import manifest from "@img/manifest";

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

/**
 * Retrieve image path from a dot-separated string
 *
 * @param  {string} resource Dot-separated string
 *
 * @return {string}          Image path
 */
export const getImagePath = (resource: string): string => {
  return resource.split(".").reduce((carry: any, key: string) => {
    if (!carry[key]) {
      throw new Error(`Cannot find resource: ${key}`);
    }
    return carry[key];
  }, manifest);
};
