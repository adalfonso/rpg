import Inanimate from "./Inanimate";
import Renderable from "@/ui/Renderable";
import Vector from "@common/Vector";
import config from "@/config";
import { Animation } from "@/ui/animation/Animation";
import { AnimationFactory } from "@/ui/animation/AnimationFactory";
import { AnimationType } from "@/ui/animation/Animation";
import { EntityConfigFactory } from "@/combat/strategy/types";
import { ItemConfig } from "@/item/types";
import { LevelFixtureTemplate } from "@/level/LevelFixture";
import { Nullable } from "@/types";
import { Stateful } from "@/interfaces";
import { isItemState, ItemState } from "@schema/inanimate/ItemSchema";
import { state } from "@/state/StateManager";
import { ucFirst, getImagePath } from "@/util";

/** An item in the context of a map/level */
export class Item extends Inanimate implements Stateful<ItemState> {
  /** Visual animation */
  private _animation: Nullable<Animation> = null;

  /** Game-related info about the item */
  private _config: ItemConfig;

  /** Unique identifier */
  private _id: string;

  /** If the item was picked up */
  private _obtained = false;

  /** UI aspect of the item */
  private _renderable: Renderable;

  /** The item reference*/
  private _ref: string;

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

    this._ref = template.type;
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

    this._resolveState();
  }

  /** The item reference */
  get ref() {
    return this._ref;
  }

  /** If the item was picked up */
  get obtained() {
    return this._obtained;
  }

  /** Get the name used for the item when rendering dialogue */
  get displayAs() {
    return this.ref
      .split("_")
      .map((s) => ucFirst(s))
      .join(" ");
  }

  /** State lookup key */
  get state_ref() {
    return `items.${this._id}`;
  }

  /** Current data state */
  get state(): ItemState {
    return { obtained: this._obtained };
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

    state().mergeByRef(`items.${this._id}`, this.state);
  }

  /**
   * Resolve the current state of the item in comparison to the game state
   *
   * @param ref - reference to where in the state the item is stored
   *
   * @return item data as stored in the state
   */
  private _resolveState() {
    const data = state().resolve(this, isItemState);

    this._obtained = data.obtained;

    return data;
  }
}
