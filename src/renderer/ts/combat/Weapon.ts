import CombatStrategy from "./CombatStrategy";
import items from "@/item/items.json";
import { bus } from "@/EventBus";

/**
 * Data required to instantiate a weapon
 *
 * @type {WeaponTemplate}
 */
type WeaponTemplate = {
  displayAs: string;
  description: string;
  value: number;
};

/**
 * Weapons are items used by the player to deal damage against an entity
 */
class Weapon extends CombatStrategy {
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
    super(items[type]);
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
}

export default Weapon;
