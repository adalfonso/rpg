import items from "@/item/items.json";
import { ucFirst } from "@/util/util";

/**
 * An item in the inventory
 */
class Item {
  /**
   * Game-related info about the item
   *
   * @prop {object} _config
   */
  private _config: any;

  /**
   * The type of item
   *
   * @prop {string} _type
   */
  private _type: string;

  /**
   * Create a new Item instance
   *
   * @param {string} type String reference to item type
   */
  constructor(type: string) {
    this._config = items[type];
    this._type = type;

    if (!this._config) {
      throw new Error(
        `Config data for item "${type}" is not defined in items.json`
      );
    }
  }

  /**
   * Get the item's category
   *
   * @return {string} The item's category
   */
  get category(): string {
    return this._config.type;
  }

  /**
   * Get the name used when rendering dialogue
   *
   * @return {string} Name used when rendering dialogue
   */
  get displayAs(): string {
    return this._type
      .split("_")
      .map((s) => ucFirst(s))
      .join(" ");
  }

  /**
   * Get the item's type
   *
   * @return {string} The item's type
   */
  get type(): string {
    return this._type;
  }
}

export default Item;
