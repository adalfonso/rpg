import Inanimate from "./Inanimate";
import MissingDataError from "@/error/MissingDataError";
import Renderable from "@/Renderable";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import items from "@/item/items.json";
import { ucFirst, getImagePath } from "@/util";

/**
 * An item in the context of a map/level
 */
class Item extends Inanimate {
  /**
   * Game-related info about the item
   */
  private _config: any;

  /**
   * Unique identifier
   */
  private _id: string;

  /**
   * If the item was picked up
   */
  private _obtained: boolean = false;

  /**
   * UI aspect of the item
   */
  private _renderable: Renderable;

  /**
   * The type of item
   */
  private _type: string;

  /**
   * Create a new Item instance
   *
   * @param position - the item's position
   * @param size     - the item's size
   * @param data     - additional info about the item
   *
   * @throws {MissingDataError} when name or type are missing
   */
  constructor(position: Vector, size: Vector, data: any) {
    super(position, size);

    if (!data?.name) {
      throw new MissingDataError(`Missing unique identifier for item.`);
    }

    if (!data?.type) {
      throw new MissingDataError(`Missing "type" for item.`);
    }

    this._type = data.type;
    this._id = data.name;

    this._config = items[data.type];

    if (!this._config) {
      throw new MissingDataError(
        `Config data for ${data.type} is not defined in items.json`
      );
    }

    const sprite = getImagePath(this._config.ui.sprite);
    const scale = this._config.ui?.scale ?? 1;
    const ratio = new Vector(1, 1);
    const fps = 0;

    this._renderable = new Renderable(sprite, scale, 0, 1, ratio, fps);

    this.resolveState(`items.${this._id}`);
  }

  /**
   * The type of item
   */
  get type(): string {
    return this._type;
  }

  /**
   * If the item was picked up
   */
  get obtained(): boolean {
    return this._obtained;
  }

  /**
   * Get the name used for the item when rendering dialogue
   */
  get displayAs(): string {
    return this.type
      .split("_")
      .map((s) => ucFirst(s))
      .join(" ");
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
    super.draw(ctx, offset, resolution);

    this._renderable.draw(ctx, this.position.plus(offset), resolution);
  }

  /**
   * Pick up the item
   */
  public obtain() {
    if (this._obtained) {
      return;
    }

    this._obtained = true;

    StateManager.getInstance().mergeByRef(`items.${this._id}`, this.getState());
  }

  /**
   * Resolve the current state of the item in comparison to the game state
   *
   * @param ref - reference to where in the state the item is stored
   *
   * @return item data as stored in the state
   */
  protected resolveState(ref: string): any {
    const state = StateManager.getInstance();

    let stateManagerData = state.get(ref);

    if (stateManagerData === undefined) {
      state.mergeByRef(ref, this.getState());
      return state.get(ref);
    }

    if (stateManagerData.obtained) {
      this._obtained = true;
    }

    return stateManagerData;
  }

  /**
   * Get current state of the item for export to a state manager
   *
   * @return current state of the item
   */
  protected getState(): object {
    return { obtained: this._obtained };
  }
}

export default Item;
