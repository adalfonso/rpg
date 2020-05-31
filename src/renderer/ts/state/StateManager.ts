import { merge } from "@/util";
import { promises as fs } from "fs";
import { bus } from "@/EventBus";
import { Eventful, CallableMap } from "@/interfaces";

/**
 * An intermediary between an on-disk JSON store and objects within the game
 */
class StateManager implements Eventful {
  /**
   * The game state
   */
  private data: object = {};

  /**
   * Location the state was last loaded from
   */
  private lastLoadedFrom: string;

  /**
   * Singleton instance
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
   * @return shared instance
   */
  public static getInstance() {
    StateManager.instance = StateManager.instance ?? new StateManager();

    return StateManager.instance;
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
    return {
      "state.save": (e: CustomEvent) => {
        this.save();
      },
    };
  }

  /**
   * Retrieve data from the state based on a key lookup
   *
   * @param ref - lookup key
   *
   * @return data stored at the reference
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
   * Merge data into the state
   *
   * Any duplicate (non-object) values will be overwritten by the new data.
   *
   * @param data - data to merge in
   */
  public merge(data: object) {
    this.data = merge(this.data, data);
  }

  /**
   * Merge data into the state via reference string
   *
   * @param ref  - reference string
   * @param data - data to merge in
   */
  public mergeByRef(ref: string, data: any) {
    let obj = {};

    ref
      .split(".")
      .reduce((carry: any, key: any, index: number, array: any[]) => {
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
   * @return state as a JSON string
   */
  public toJson(): string {
    return JSON.stringify(this.data);
  }

  /**
   * Remove part of the state with a dot-separated string reference
   *
   * @param ref - reference to a value within the state
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
      console.error(
        `Warning: Tried to remove a non-existent reference from the state manager: ${ref}`
      );
    }
  }

  /**
   * Save the state to disk at a specified location
   *
   * @param destination - disk location to save the state at
   *
   * @return promise for write operation
   *
   * @emits state.saved
   */
  public save(destination: string = this.lastLoadedFrom): Promise<void> {
    destination = this.parseFileDestination(destination);

    return fs
      .writeFile(destination, this.toJson())
      .then(() => {
        bus.emit("state.saved");
      })
      .catch((err) => {
        console.error(`Could not save state to "${destination}".`);
      });
  }

  /**
   * Load game state from a location on disk
   *
   * @param destination - disk location to load the state from
   *
   * @return promise for read operation
   *
   * @emits file.load
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
        console.error(`Could not load state from "${destination}".`);
        this.save(destination);
      })
      .finally(() => {
        this.lastLoadedFrom = destination;
      });
  }

  /**
   * Make sure the destination is a json file
   *
   * @param destination - destination path
   *
   * @return formatted destination path
   */
  private parseFileDestination(destination: string): string {
    return /\.json$/.test(destination) ? destination : destination + ".json";
  }
}

export default StateManager;
