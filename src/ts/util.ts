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
