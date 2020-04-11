export default interface Lockable {
  locked: boolean;

  lock(): boolean;
  unlock(): boolean;
}
