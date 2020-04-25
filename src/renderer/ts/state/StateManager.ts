import { merge } from "@/Util/util";

/**
 * StateManager is an intermediary between an on-disk JSON store and objects
 * interacting within the game.
 */
class StateManager {
  /**
   * The game state
   *
   * @prop {object} data
   */
  private data: object = {};

  /**
   * Singleton instance
   *
   * @prop {StateManager} instance
   */
  private static instance: StateManager;

  /**
   * Create a new instance or get the shared instance
   *
   * @return {StateManager} Shared instance
   */
  public static getInstance() {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }

    return StateManager.instance;
  }

  /**
   * Merge data into the state. Any duplicate (non-object) values will be
   * overwritten by the new data.
   *
   * @param {object} data Data to merge in
   */
  public merge(data: object) {
    this.data = merge(this.data, data);
  }

  /**
   * Return the state in JSON form
   *
   * @return {string} State as a JSON string
   */
  public toJson(): string {
    return JSON.stringify(this.data);
  }

  /**
   * Remove part of the state with a dot-separated string reference;
   *
   * @param {string} ref Reference to a value within the state
   */
  public remove(ref: string) {
    let current = this.data;

    let keys = ref.split(".");
    try {
      for (let i = 0, length = keys.length; i < length; i++) {
        let key = keys[i];

        if (i + 1 === length) {
          delete current[key];
        } else {
          current = current[key];
        }
      }
    } catch (e) {
      console.log(
        `Warning: Tried to remove a non-existent reference from the state manager: ${ref}`
      );
    }
  }
}

export default StateManager;
