import MissingDataError from "@/error/MissingDataError";
import Renderable from "@/ui/Renderable";
import Vector from "@common/Vector";
import { CombatStrategyTemplate } from "./types";
import { bus } from "@/EventBus";
import { getImagePath } from "@/util";

/**
 * Base technique for combat-related skills an actor has
 */
class CombatStrategy {
  /**
   * Renderable sprite for the combat strategy
   */
  protected _sprite: Renderable;

  /**
   * Create a new CombatStrategy instance
   *
   * @param template - combat strategy template
   */
  constructor(protected _template: CombatStrategyTemplate) {
    this.loadSprite(this._template.ui.sprite);
  }

  /**
   * Get the base amount of damage the combat strategy deals
   */
  get damage(): number {
    return this._template.value;
  }

  /**
   * Get the description of the combat strategy
   */
  get description(): string {
    return this._template.description;
  }

  /**
   * Get the display name of the combat strategy
   */
  get displayAs(): string {
    return this._template.displayAs;
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
  private loadSprite(path: string) {
    try {
      const image = getImagePath(path);
      const scale = 1;
      const ratio = new Vector(1, 1);
      const fps = 1;

      this._sprite = new Renderable(image, scale, 0, 0, ratio, fps);
    } catch (e) {
      throw new MissingDataError(
        `Unable to find ui.sprite "${path}" in template when loading ${this.constructor.name}.`
      );
    }
  }
}

export default CombatStrategy;
