/** Base mixin constructor definition */
export type Constructor<T = Record<string, any>> = new (...args: any[]) => T;

/** Used as a kernel class to implement the mixin pattern */
export class Empty {}
