import CombatStrategy from "./CombatStrategy";
import { CombatStrategyTemplate } from "./types";
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
   * Create a new Weapon instance
   *
   * @param template - weapon's template
   * @param _type    - weapon type
   */
  constructor(template: CombatStrategyTemplate, private _type: string) {
    super(template);
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
