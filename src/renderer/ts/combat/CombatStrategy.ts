import MissingDataError from "@/error/MissingDataError";
import Renderable from "@/Renderable";
import Vector from "@common/Vector";
import { bus } from "@/EventBus";
import { getImagePath } from "@/util";

/**
 * Data required to instantiate a combat strategy
 */
type CombatStrategyTemplate = {
  displayAs: string;
  description: string;
  value: number;
  ui?: UiData;
};

/**
 * Required Ui data for the combat strategy
 */
export type UiData = {
  sprite: string;
};

/**
 * Base technique for combat-related skills an actor has
 */
class CombatStrategy {
  /**
   * The name of the combat strategy
   */
  protected _displayAs: string;

  /**
   * The amount of damage a combat strategy deals
   */
  protected _value: number;

  /**
   * A description of the combat strategy
   */
  protected _description: string;

  /**
   * Renderable sprite for the combat strategy
   */
  protected _sprite: Renderable;

  /**
   * Create a new CombatStrategy instance
   *
   * @param template - combat strategy template
   *
   * @throws {MissingDataError} when any required template field is missing
   */
  constructor(template: CombatStrategyTemplate) {
    if (!template) {
      throw new MissingDataError(
        `Unable to find template when creating "${this.constructor.name}".`
      );
    }

    ["_displayAs", "_description", "_value"].forEach((prop) => {
      let lookupName = prop.replace(/_/g, "");
      let value = template[lookupName];

      if (!value) {
        throw new MissingDataError(
          `Unable to find "${lookupName}" when creating "${this.constructor.name}" from template.`
        );
      }

      this[prop] = value;
    });

    this.loadSprite(template);
  }

  /**
   * Get the base amount of damage the combat strategy deals
   */
  get damage(): number {
    return this._value;
  }

  /**
   * Get the description of the combat strategy
   */
  get description(): string {
    return this._description;
  }

  /**
   * Get the display name of the combat strategy
   */
  get displayAs(): string {
    return this._displayAs;
  }

  /**
   * Draw the combat strategy
   *
   * @param ctx         - render context
   * @param offset      - render position offset
   * @param _resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    _resolution: Vector
  ) {
    this._sprite.draw(ctx, offset);
  }

  /**
   * Emit a battle action event with the combat strategy
   *
   * @emits battle.action
   */
  public use() {
    bus.emit("battle.action", { combatStrategy: this });
  }

  /**
   * Load sprite data for the combat strategy
   *
   * @param template - combat strategy template
   *
   * @throws {MissingDataError} when sprite data cannot be loaded
   */
  private loadSprite(template: CombatStrategyTemplate) {
    if (!template.ui?.sprite) {
      return;
    }

    try {
      const image = getImagePath(template.ui.sprite);
      const scale = 1;
      const ratio = new Vector(1, 1);
      const fps = 1;

      this._sprite = new Renderable(image, scale, 0, 0, ratio, fps);
    } catch (e) {
      throw new MissingDataError(
        `Unable to find ui.sprite "${template.ui.sprite}" in template when loading ${this.constructor.name}.`
      );
    }
  }
}

export default CombatStrategy;
