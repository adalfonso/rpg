import MissingDataError from "@/error/MissingDataError";
import Renderable from "@/Renderable";
import Vector from "@common/Vector";
import { bus } from "@/EventBus";
import { getImagePath } from "@/util";

/**
 * Data required to instantiate a combat strategy
 *
 * @type {CombatStrategyTemplate}
 */
type CombatStrategyTemplate = {
  displayAs: string;
  description: string;
  value: number;
  ui?: UiData;
};

/**
 * Required Ui data for the combat strategy
 *
 * @type {UiData}
 */
export type UiData = {
  sprite: string;
};

/**
 * CombatStrategy is the base technique for combat-related skills an actor has.
 */
class CombatStrategy {
  /**
   * The name of the combat strategy
   *
   * @prop {string} _displayAs
   */
  protected _displayAs: string;

  /**
   * The amount of damage a combat strategy deals
   *
   * @prop {number} _value
   */
  protected _value: number;

  /**
   * A description of the combat strategy
   *
   * @prop {string} _description
   */
  protected _description: string;

  /**
   * Renderable sprite for the combat strategy
   *
   * @prop {Renderable} _sprite
   */
  protected _sprite: Renderable;

  /**
   * Create a new CombatStrategy instance
   *
   * @param  {CombatStrategyTemplate} template Combat strategy template
   *
   * @throws {MissingDataError} When any required template field is missing
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
   *
   * @return {number} Base damage of the combat strategy
   */
  get damage(): number {
    return this._value;
  }

  /**
   * Get the description of the combat strategy
   *
   * @return {string} Description of the combat strategy
   */
  get description(): string {
    return this._description;
  }

  /**
   * Get the display name of the combat strategy
   *
   * @return {string} Display name of the combat strategy
   */
  get displayAs(): string {
    return this._displayAs;
  }

  /**
   * Draw the combat strategy
   *
   * @param {CanvasRenderingContext2D} ctx         Render context
   * @param {Vector}                   offset      Render position offset
   * @param {Vector}                   _resolution Render resolution
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
   */
  public use() {
    bus.emit("battle.action", { combatStrategy: this });
  }

  /**
   * Load sprite data for the combat strategy
   *
   * @param {CombatStrategyTemplate} template Combat strategy template
   *
   * @throws {MissingDataError} When sprite data cannot be loaded
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
