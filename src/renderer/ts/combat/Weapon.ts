import items from "@/item/items.json";
import { bus } from "@/EventBus";

/**
 * Data required to instantiate a weapon
 *
 * @type {SpellData}
 */
type WeaponData = {
  displayAs: string;
  description: string;
  value: number;
};

/**
 * Weapons are items used by the player to deal damage against an entity
 */
class Weapon {
  /**
   * The name of the weapon
   *
   * @prop {string} _displayAs
   */
  private _displayAs: string;

  /**
   * The amount of damage a weapon deals
   *
   * @prop {number} _value
   */
  private _value: number;

  /**
   * A description of the weapon
   *
   * @prop {stirng} _description
   */
  private _description: string;

  /**
   * If the weapon is currently equipped
   *
   * @prop {boolean} _isEquipped
   */

  private _isEquipped: boolean = false;

  /**
   * Create a new weapon instance
   *
   * @param {string} type Item type
   */
  constructor(type: string) {
    let data: WeaponData = items[type];

    if (!data) {
      console.log(type);
      throw new Error(`Unable to find weapon data for "${type}" in items.json`);
    }

    this._displayAs = data.displayAs;
    this._description = data.description;
    this._value = data.value;
  }

  /**
   * Get the base amount of damage the weapon deals
   *
   * @return {number} Base damage of the weapon
   */
  get damage(): number {
    return this._value;
  }

  /**
   * Get the description of the weapon
   *
   * @return {string} Description of the weapon
   */
  get description(): string {
    return this._description;
  }

  /**
   * Get the display name of the weapon
   *
   * @return {string} Display name of the weapon
   */
  get displayAs(): string {
    return this._displayAs;
  }

  /**
   * Determine if the weapon is equipped
   *
   * @return {boolean} If the weapon is equipped
   */
  get isEquipped(): boolean {
    return this._isEquipped;
  }

  /**
   * Equip the weapon
   */
  public equip() {
    this._isEquipped = true;

    bus.emit("weapon.equip", { weapon: this });
  }

  /**
   * Emit a battleAction event with the weapon
   */
  public use() {
    bus.emit("battle.action", this);
  }
}

export default Weapon;
