import { bus } from "@/EventBus";

/**
 * Data required to instantiate a combat strategy
 *
 * @type {CombatStrategyTemplate}
 */
type CombatStrategyTemplate = {
  displayAs: string;
  description: string;
  value: number;
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
   * Create a new CombatStrategy instance
   *
   * @param {CombatStrategyTemplate} template CombatStrategyTemplate
   */
  constructor(template: CombatStrategyTemplate) {
    if (!template) {
      throw new Error(
        `Unable to create template when creating "${this.constructor.name}".`
      );
    }

    ["_displayAs", "_description", "_value"].forEach((prop) => {
      let lookupName = prop.replace(/_/g, "");
      let value = template[lookupName];

      if (!value) {
        throw new Error(
          `Unable to find "${lookupName}" when creating "${this.constructor.name}" from template.`
        );
      }

      this[prop] = value;
    });
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
   * Emit a battle action event with the combat strategy
   */
  public use() {
    bus.emit("battle.action", this);
  }
}

export default CombatStrategy;
