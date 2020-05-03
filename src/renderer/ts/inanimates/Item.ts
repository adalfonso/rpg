import Inanimate from "./Inanimate";
import Vector from "@common/Vector";
import items from "@/item/items.json";
import StateManager from "@/state/StateManager";

/**
 * A clip is an area of the map that entities cannot traverse. e.g. a wall.
 */
class Item extends Inanimate {
  /**
   * Unique identifier
   *
   * @prop {string} id
   */
  private id: string;

  /**
   * If the item was picked up
   *
   * @prop {boolean} _obtained
   */
  private _obtained: boolean = false;

  /**
   * Create a new clip instance
   *
   * @param {Vector} position The clip's position
   * @param {Vector} size     The clip's size
   */
  constructor(position: Vector, size: Vector, data) {
    super(position, size);

    if (!data?.name) {
      throw new Error(`Missing unique identifier for item.`);
    }

    if (!data?.type) {
      throw new Error(`Missing "type" for item.`);
    }

    this.id = data.name;

    this.resolveState(`items.${this.id}`);
  }

  /**
   * Draw the clip
   *
   * @param {CanvasRenderingContext2D} ctx Render context
   */
  public draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
    super.debugDraw(ctx);
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
   * Pick up the item
   */
  public obtain() {
    if (this._obtained) {
      return;
    }

    this._obtained = true;
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
