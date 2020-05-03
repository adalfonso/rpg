import { bus } from "@/EventBus";

/**
 * Standard infomation that a weapon must have
 *
 * @type {WeaponData}
 */
type WeaponData = {
  name: string;
  description: string;
  damage: number;
};

/**
 * Weapons are items used by the player to deal damage against an entity
 */
export default class Weapon {
  /**
   * The type of item a weapon is
   *
   * @prop {string} type
   */
  public type: string = "equipable";

  /**
   * The amount of damage a weapon deals
   *
   * @prop {number} damage
   */
  public damage: number;

  /**
   * The name of the weapon
   *
   * @prop {string} name
   */
  public name: string;

  /**
   * A description of the weapon
   *
   * @prop {stirng} description
   */
  public description: string;

  /**
   * Create a new weapon instance
   *
   * @param {WeaponData} data
   */
  constructor(data: WeaponData) {
    for (let datum in data) {
      this[datum] = data[datum];
    }
  }

  /**
   * Emit a battleAction event with the weapon
   */
  public use() {
    bus.emit("battle.action", this);
  }
}
