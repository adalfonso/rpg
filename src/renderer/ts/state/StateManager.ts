import { merge } from "@/util/util";
import { promises as fs } from "fs";
import { bus } from "@/EventBus";

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
   * Location the state was last loaded from
   *
   * @prop {string} lastLoadedFrom
   */
  private lastLoadedFrom: string;

  /**
   * Singleton instance
   *
   * @prop {StateManager} instance
   */
  private static instance: StateManager;

  /**
   * Create a new StateManager instance
   */
  constructor() {
    bus.register(this);
  }

  /**
   * Create a new instance or get the shared instance
   *
   * @return {StateManager} Shared instance
   */
  public static getInstance() {
    StateManager.instance = StateManager.instance ?? new StateManager();

    return StateManager.instance;
  }

  /**
   * Register events with the event bus
   *
   * @return {object} Events to register
   */
  public register(): object {
    return {
      "state.save": (e) => {
        this.save();
      },
    };
  }

  /**
   * Retrieve data from the state based on a key lookup
   *
   * @param  {string} ref Lookup key
   *
   * @return {any}        Data stored at the reference
   */
  public get(ref: string): any {
    try {
      return ref.split(".").reduce((current, key) => {
        return current[key];
      }, this.data);
    } catch (e) {
      return undefined;
    }
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
   * Merge data into the state via reference string
   *
   * @param {string} ref  Reference string
   * @param {any}    data Data to merge in
   */
  public mergeByRef(ref: string, data: any) {
    let obj = {};

    ref.split(".").reduce((carry, key, index, array) => {
      if (index + 1 < array.length) {
        carry[key] = {};
      } else {
        carry[key] = data;
      }
      return carry[key];
    }, obj);

    this.merge(obj);
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

  /**
   * Save the state to disk at a specified location
   *
   * @param  {string} destination Disk location to save the state at
   *
   * @return {Promise<void>} Promise for write operation
   */
  public save(destination: string = this.lastLoadedFrom): Promise<void> {
    destination = this.parseFileDestination(destination);

    return fs
      .writeFile(destination, this.toJson())
      .then(() => {
        bus.emit("state.saved");
      })
      .catch((err) => {
        console.log(`Could not save state to "${destination}".`);
      });
  }

  /**
   * Load game state from a location on disk
   *
   * @param  {string} destination Disk location to load the state from
   *
   * @return {Promise<string | void>} Promise for read operation
   */
  public load(destination: string): Promise<string | void> {
    destination = this.parseFileDestination(destination);

    return fs
      .readFile(this.parseFileDestination(destination), "UTF-8")
      .then((contents: string) => {
        this.data = JSON.parse(contents);
        bus.emit("file.load");
      })
      .catch((err) => {
        console.log(`Could not load state from "${destination}".`);
        this.save(destination);
      })
      .finally(() => {
        this.lastLoadedFrom = destination;
      });
  }

  /**
   * Make sure the destination is a json file
   *
   * @param  {string} destination Destination path
   *
   * @return {string}             Formatted destination path;
   */
  private parseFileDestination(destination: string): string {
    return /\.json$/.test(destination) ? destination : destination + ".json";
  }
}

export default StateManager;
