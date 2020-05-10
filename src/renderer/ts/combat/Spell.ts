import { bus } from "@/EventBus";

/**
 * Data required to instantiate a spell
 *
 * @type {SpellData}
 */
type SpellData = {
  displayAs: string;
  description: string;
  value: number;
  special: boolean;
};

/**
 * Spells are techniques used by the player to deal damage against an entity
 */
class Spell {
  /**
   * The name of the spell
   *
   * @prop {string} _displayAs
   */
  private _displayAs: string;

  /**
   * The amount of damage a spell deals
   *
   * @prop {number} _value
   */
  private _value: number;

  /**
   * A description of the spell
   *
   * @prop {stirng} _description
   */
  private _description: string;

  /**
   * Whether the spell deals special damage
   *
   * @prop {boolean} _special
   */
  private _special: boolean;

  /**
   * Create a new Spell instance
   *
   * @param {SpellData} data SpellData
   */
  constructor(data: SpellData) {
    this._displayAs = data.displayAs;
    this._description = data.description;
    this._value = data.value;
    this._special = data.special;
  }

  /**
   * Get the base amount of damage the spell deals
   *
   * @return {number} Base damage of the spell
   */
  get damage(): number {
    return this._value;
  }

  /**
   * Get the display name of the spell
   *
   * @return {string} Display name of the spell
   */
  get displayAs(): string {
    return this._displayAs;
  }

  /**
   * Emit a battleAction event with the spell
   */
  public use() {
    bus.emit("battle.action", this);
  }
}

export default Spell;
