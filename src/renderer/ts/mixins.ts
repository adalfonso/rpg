/**
 * Base mixin constructor definition
 */
export type Constructor<T = {}> = new (...args: any[]) => T;
