import MissingDataError from "@/error/MissingDataError";
import Renderable from "@/ui/Renderable";
import Vector from "@common/Vector";
import config from "@/config";
import items from "@/item/items";
import { ItemConfig } from "./types";
import { ucFirst, getImagePath } from "@/util";

/** An item in the context of an inventory */
class Item {
  /** Game-related info about the item */
  private _config: ItemConfig;

  /** UI aspect of the item */
  private _renderable: Renderable;

  /**
   * Create a new Item instance
   *
   * @param _ref - string reference to item type
   *
   * @throws {MissingDataError} when config is missing
   */
  constructor(private _ref: string) {
    this._config = items[_ref];

    if (!this._config) {
      throw new MissingDataError(
        `Config data for item "${_ref}" is not defined in items.ts`
      );
    }

    const sprite = getImagePath(this._config.ui.sprite);
    // TODO: streamline how scaling is handled
    const scale = (this._config.ui?.scale ?? 1) * config.scale;
    const ratio = new Vector(1, 1);
    const fps = 0;

    this._renderable = new Renderable(sprite, scale, 0, 1, ratio, fps);
  }

  /** Get the item's category */
  get category(): string {
    return this._config.category;
  }

  /** Get the description of the item */
  get description(): string {
    return this._config.description ?? this.displayAs;
  }

  /** Get the name used when rendering dialogue */
  get displayAs(): string {
    return this._ref
      .split("_")
      .map((s) => ucFirst(s))
      .join(" ");
  }

  /** Get the item's ref */
  get ref(): string {
    return this._ref;
  }

  /**
   * Draw the item
   *
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    this._renderable.draw(ctx, offset, resolution);
  }
}

export default Item;
