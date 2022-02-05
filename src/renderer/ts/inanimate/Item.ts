import Inanimate from "./Inanimate";
import Renderable from "@/ui/Renderable";
import StateManager from "@/state/StateManager";
import Vector from "@common/Vector";
import config from "@/config";
import { Animation } from "@/ui/animation/Animation";
import { AnimationFactory } from "@/ui/animation/AnimationFactory";
import { AnimationType } from "@/ui/animation/Animation";
import { EntityConfigFactory } from "@/combat/strategy/types";
import { ItemConfig } from "@/item/types";
import { LevelFixtureTemplate } from "@/level/LevelFixture";
import { ucFirst, getImagePath } from "@/util";

/** An item in the context of a map/level */
export class Item extends Inanimate {
  /** Visual animation */
  private _animation: Animation | null;

  /** Game-related info about the item */
  private _config: ItemConfig;

  /** Unique identifier */
  private _id: string;

  /** If the item was picked up */
  private _obtained = false;

  /** UI aspect of the item */
  private _renderable: Renderable;

  /** The type of item */
  private _type: string;

  /**
   * Create a new Item instance
   *
   * @param position - the item's position
   * @param size     - the item's size
   * @param template    - additional info about the item
   * @param config_ctor - used to access a config from a template
   * @param animation_factory - create an animation from an animation template
   *
   * @throws {MissingDataError} when name or type are missing
   */
  constructor(
    position: Vector,
    size: Vector,
    template: LevelFixtureTemplate,
    config_ctor: EntityConfigFactory<ItemConfig>,
    animation_factory: AnimationFactory
  ) {
    super(position, size);

    this._type = template.type;
    this._id = template.name;

    this._config = config_ctor(template);

    if (this._config.ui.animation) {
      this._animation = animation_factory(this._config.ui.animation)(this.size);
    }

    const sprite = getImagePath(this._config.ui.sprite);

    // TODO: streamline how scaling is handled
    const scale = (this._config.ui?.scale ?? 1) * config.scale;
    const ratio = new Vector(1, 1);
    const fps = 0;

    this._renderable = new Renderable(sprite, scale, 0, 1, ratio, fps);

    this.resolveState(`items.${this._id}`);
  }

  /** The type of item */
  get type(): string {
    return this._type;
  }

  /** If the item was picked up */
  get obtained(): boolean {
    return this._obtained;
  }

  /** Get the name used for the item when rendering dialogue */
  get displayAs(): string {
    return this.type
      .split("_")
      .map((s) => ucFirst(s))
      .join(" ");
  }

  /**
   * Update the item
   *
   * @param ts - delta time
   */
  public update(dt: number) {
    if (!this._animation) {
      return;
    }

    const { type, delta } = this._animation.update(dt);

    // only handles position animations for now
    if (type !== AnimationType.Position) {
      return;
    }

    this.position = this.position.plus(delta);
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

  /** Pick up the item */
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

    // TODO: eslint artifact (any)
    const stateManagerData = state.get(ref) as any;

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
  protected getState(): Record<string, unknown> {
    return { obtained: this._obtained };
  }
}
