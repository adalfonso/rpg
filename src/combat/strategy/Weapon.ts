import CombatStrategy from "./CombatStrategy";
import Damage from "../Damage";
import Renderable from "@/ui/Renderable";
import { EntityConfig } from "./types";
import {
  Descriptive,
  DamageDealing,
  Equipable,
  Visual,
} from "./CombatStrategy";

/** Items used by the player to deal damage against an entity */
class Weapon extends DamageDealing(
  Equipable(Visual(Descriptive(CombatStrategy)))
) {
  /**
   * Create a new Weapon instance
   *
   * @param _template - weapon's template
   * @param _ui       - UI component of the weapon
   * @param _damage   - damage the weapon deals
   * @param ref       - weapon type
   */
  constructor(
    protected _template: EntityConfig,
    protected _ui: Renderable,
    protected _damage: Damage,
    readonly ref: string
  ) {
    super();
  }
}

export default Weapon;
