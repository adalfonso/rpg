import MissingDataError from "@/error/MissingDataError";
import items from "@/item/items.json";
import { ucFirst } from "@/util";

/**
 * An item in the context of an inventory
 */
class Item {
  /**
   * Game-related info about the item
   */
  private _config: any;

  /**
   * Create a new Item instance
   *
   * @param _type - string reference to item type
   *
   * @throws {MissingDataError} when config is missing
   */
  constructor(private _type: string) {
    this._config = items[_type];

    if (!this._config) {
      throw new MissingDataError(
        `Config data for item "${_type}" is not defined in items.json`
      );
    }
  }

  /**
   * Get the item's category
   */
  get category(): string {
    return this._config.type;
  }

  /**
   * Get the name used when rendering dialogue
   */
  get displayAs(): string {
    return this._type
      .split("_")
      .map((s) => ucFirst(s))
      .join(" ");
  }

  /**
   * Get the item's type
   */
  get type(): string {
    return this._type;
  }
}

export default Item;
