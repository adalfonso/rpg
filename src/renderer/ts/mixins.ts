/** Base mixin constructor definition */
export type Constructor<T = {}> = new (...args: any[]) => T;

/** Used as a kernel class to implement the mixin pattern */
export class Empty {}
