import CombatStrategy from "./CombatStrategy";
import items from "@/item/items.json";
import { bus } from "@/EventBus";

/**
 * Items used by the player to deal damage against an entity
 */
class Weapon extends CombatStrategy {
  /**
   * If the weapon is currently equipped
   */
  private _isEquipped: boolean = false;

  /**
   * Create a new weapon instance
   *
   * @param _type - item type
   */
  constructor(private _type: string) {
    super(items[_type]);
  }

  /**
   * Determine if the weapon is equipped
   */
  get isEquipped(): boolean {
    return this._isEquipped;
  }

  /**
   * Get the weapon's type
   */
  get type(): string {
    return this._type;
  }

  /**
   * Equip the weapon
   *
   * @emits weapon.equip
   */
  public equip() {
    this._isEquipped = true;

    bus.emit("weapon.equip", { weapon: this });
  }

  /**
   * Unequip the weapon
   */
  public unequip() {
    this._isEquipped = false;
  }
}

export default Weapon;
