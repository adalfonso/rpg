import { Stateful } from "@/interfaces";
import { bus, EventType } from "@/event/EventBus";
import { fs } from "@tauri-apps/api";
import { merge } from "@/util";

/** An intermediary between an on-disk JSON store and objects within the game */
export class StateManager {
  /** The game state */
  private data: Record<string, unknown> = {};

  /** Location the state was last loaded from */
  private lastLoadedFrom = "";

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
    const data_is_valid = guard(data);

    if (data && !data_is_valid) {
      console.info(
        `Unexpected data in state for "${source.state_ref}". Merging in fresh data instead.`
      );
    }

    return data_is_valid ? data : this.mergeByRef(ref, source.state);
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
      console.info(
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
  public async save(destination: string = this.lastLoadedFrom) {
    // TODO: Sanitize the destination
    try {
      await fs.writeFile({ path: destination, contents: this.toJson() });
      bus.emit("state.saved");
    } catch (e) {
      console.error(`Could not save state to "${destination}".`);
    }
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
  public async load(destination: string) {
    // TODO: Sanitize the destination
    try {
      const contents = await fs.readTextFile(destination);

      this.data = JSON.parse(contents);

      bus.emit("file.load");
    } catch (e) {
      console.error(`Could not load state from "${destination}".`);
      this.save(destination);
    }

    this.lastLoadedFrom = destination;
  }
}

/** Helper for getting the state manager */
export const state = () => StateManager.getInstance();
