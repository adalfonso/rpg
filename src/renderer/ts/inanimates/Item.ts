import Inanimate from "./Inanimate";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import { ucFirst } from "@/util";

/**
 * An item laying on the ground
 */
class Item extends Inanimate {
  /**
   * Unique identifier
   *
   * @prop {string} _id
   */
  private _id: string;

  /**
   * If the item was picked up
   *
   * @prop {boolean} _obtained
   */
  private _obtained: boolean = false;

  /**
   * The type of item
   *
   * @prop {string} _type
   */
  private _type: string;

  /**
   * Create a new Item instance
   *
   * @param {Vector} position The item's position
   * @param {Vector} size     The item's size
   * @param {object} data     Additional info about the item
   */
  constructor(position: Vector, size: Vector, data: any) {
    super(position, size);

    if (!data?.name) {
      throw new Error(`Missing unique identifier for item.`);
    }

    if (!data?.type) {
      throw new Error(`Missing "type" for item.`);
    }

    this._type = data.type;
    this._id = data.name;

    this.resolveState(`items.${this._id}`);
  }

  /**
   * The type of item
   *
   * @return {string} The type of item
   */
  get type(): string {
    return this._type;
  }

  /**
   * If the item was picked up
   *
   * @return {boolean} If the item was picked up
   */
  get obtained(): boolean {
    return this._obtained;
  }

  /**
   * Get the name used for the item when rendering dialogue
   *
   * @return {string} Name used for item when rendering dialogue
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
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    super.draw(ctx, offset, resolution);

    // Force debugDraw temporarily
    super.debugDraw(ctx, new Vector(0, 0), resolution);
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
   * @param  {string} ref Reference to where in the state the item is stored
   *
   * @return {object}     Item data as stored in the state
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
   * @return {object} Current state of the item
   */
  protected getState(): object {
    return { obtained: this._obtained };
  }
}

export default Item;
