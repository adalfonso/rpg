import * as ex from "excalibur";
import { Animation, AnimationType } from "@/ui/animation/Animation";
import { AnimationFactory } from "@/ui/animation/AnimationFactory";
import { CollisionType } from "excalibur";
import { Direction, RenderData } from "@/ui/types";
import { EntityConfigFactory } from "@/combat/strategy/types";
import { ItemConfig } from "@/item/types";
import { MultiSprite, SpriteOrientation } from "@/ui/MultiSprite";
import { Nullable } from "@/types";
import { Player } from "@/actor/Player";
import { Stateful } from "@/interfaces";
import { TiledTemplate } from "@/actor/types";
import { bus } from "@/event/EventBus";
import { isItemState, ItemState } from "@schema/inanimate/ItemSchema";
import { state } from "@/state/StateManager";
import { ucFirst, getImagePath } from "@/util";

/** An item in the context of a map/level */
export class Item extends MultiSprite(ex.Actor) implements Stateful<ItemState> {
  /** Visual animation */
  private _animation: Nullable<Animation> = null;

  /** Game-related info about the item */
  private _config: ItemConfig;

  /** Unique identifier */
  private _id: string;

  /** If the item was picked up */
  private _obtained = false;

  /** The item reference*/
  private _ref: string;

  /**
   * Create a new Item instance
   *
   * @param _template - info about the item
   * @param config_ctor - used to access an item config from a template
   * @param animation_factory - create an animation from an animation template
   *
   * @throws {MissingDataError} when name or type are missing
   */
  constructor(
    protected _template: TiledTemplate,
    config_ctor: EntityConfigFactory<ItemConfig>,
    animation_factory: AnimationFactory
  ) {
    super({ ..._template, collisionType: CollisionType.Passive });

    this._config = config_ctor(_template);

    this._setSprites(this.getUiInfo(), this._template).then(() => {
      this.direction = Direction.South;
    });

    this._ref = this._template.class;
    this._id = this._template.name;

    if (this._config.ui.animation) {
      this._animation = animation_factory(this._config.ui.animation)(this.size);
    }

    this._resolveState();

    this.on("collisionstart", (evt) => {
      if (!(evt.other instanceof Player)) {
        return;
      }

      this.obtain();
      bus.emit("item.obtain", { item: this });

      const useVowel = ["a", "e", "i", "o", "u"].includes(
        this.displayAs[0].toLowerCase()
      );

      bus.emit("dialogue.create", {
        speech: [`Picked up ${useVowel ? "an" : "a"} ${this.displayAs}!`],
      });
    });
  }

  /**
   * Hook the pre-update
   *
   * @param _engine - game engine instance
   * @param dt - delta time
   */
  public onPreUpdate(_engine: ex.Engine, dt: number) {
    if (!this._animation) {
      return;
    }

    const { type, delta } = this._animation.update(dt);

    // only handles position animations for now
    if (type !== AnimationType.Position) {
      return;
    }

    this.pos = this.pos.add(delta);
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

  /** Pick up the item */
  public obtain() {
    if (this._obtained) {
      return;
    }

    this._obtained = true;

    state().mergeByRef(`items.${this._id}`, this.state);
  }

  /**
   * Get render info from an actor's config
   *
   * @return inputs for a renderable
   */
  protected getUiInfo(): RenderData {
    const ui = this._config.ui;

    return {
      fps: 1,
      columns: 1,
      rows: 1,
      scale: ui.scale ?? 1,
      sprite: getImagePath(ui.sprite),
      sprite_orientation: SpriteOrientation.Singular,
    };
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
