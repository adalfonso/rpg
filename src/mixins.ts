/** Base mixin constructor definition */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type Constructor<T = Empty> = new (...args: any[]) => T;

/** Used as a kernel class to implement the mixin pattern */
export class Empty {}
