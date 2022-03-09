import { DEFAULT_SAVE_LOCATION } from "@/constants";
import { bus, EventType } from "@/EventBus";
import { merge } from "@/util";
import { promises as fs } from "fs";
import { Stateful } from "@/interfaces";

/** An intermediary between an on-disk JSON store and objects within the game */
class StateManager {
  /** The game state */
  private data: Record<string, unknown> = {};

  /** Location the state was last loaded from */
  private lastLoadedFrom: string = DEFAULT_SAVE_LOCATION;

  /** Singleton instance */
  private static instance: StateManager;

  /** Create a new StateManager instance */
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
  public register() {
    return {
      [EventType.Custom]: {
        "state.save": (_e: CustomEvent) => {
          this.save();
        },
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
  public get(ref?: string): any {
    if (ref === undefined) {
      return this.data;
    }

    try {
      return ref.split(".").reduce((current, key) => {
        return current[key] as any;
      }, this.data);
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Get or write class instance state data to the state
   *
   * @param source - source class instance
   * @param gaurd - type gaurd to validate data return from state
   *
   * @return state data
   */
  public resolve<T>(
    source: Stateful<T>,
    guard: (data: unknown) => data is T
  ): T {
    const ref = source.state_ref;
    const data = this.get(ref);

    return guard(data) ? data : this.mergeByRef(ref, source.state);
  }

  /** Completely wipe out the state */
  public empty() {
    this.data = {};
  }

  /**
   * Merge data into the state
   *
   * Any duplicate (non-object) values will be overwritten by the new data.
   *
   * @param data - data to merge in
   */
  public merge(data: Record<string, unknown>) {
    this.data = merge(this.data, data);
  }

  /**
   * Merge data into the state via reference string
   *
   * @param ref  - reference string
   * @param data - data to merge in
   *
   * @returns data after merge
   */
  public mergeByRef(ref: string, data: unknown) {
    const obj = {};

    ref.split(".").reduce((carry, key, index, array) => {
      if (index + 1 < array.length) {
        carry[key] = {};
      } else {
        carry[key] = data;
      }
      return carry[key];
    }, obj);

    this.merge(obj);

    return this.get(ref);
  }

  /**
   * Get part of the state by ref, or merge in a value if it is empty
   *
   * This is commonly used to resolve the state of a class when it loads
   *
   * @param ref - reference string
   * @param data - data to merge
   * @returns  - data stored at the reference or fallback data
   */
  public getOrMergeByRef(ref: string, data: unknown) {
    const current = this.get(ref);

    if (current !== undefined) {
      return current;
    }

    this.mergeByRef(ref, data);

    return this.get(ref);
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

    const keys = ref.split(".");
    try {
      for (let i = 0, length = keys.length; i < length; i++) {
        const key = keys[i];

        if (i + 1 === length) {
          delete current[key];
        } else {
          current = current[key] as any;
        }
      }
    } catch (e) {
      console.warn(
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
      .catch((_err) => {
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
      .readFile(this.parseFileDestination(destination), { encoding: "utf8" })
      .then((contents) => {
        if (typeof contents !== "string") {
          throw new Error("Got unexpected Buffer when reading file.");
        }
        this.data = JSON.parse(contents);
        bus.emit("file.load");
      })
      .catch((_err) => {
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

/** Helper for getting the state manager */
export const state = () => StateManager.getInstance();
