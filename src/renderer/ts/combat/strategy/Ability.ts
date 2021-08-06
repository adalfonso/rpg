import CombatStrategy from "./CombatStrategy";
import Damage from "../Damage";
import Renderable from "@/ui/Renderable";
import { Descriptive, DamageDealing, Visual } from "./CombatStrategy";
import { EntityConfig } from "./types";

/**
 * Technique learned by an actor
 */
class Ability extends DamageDealing(Visual(Descriptive(CombatStrategy))) {
  /**
   * Create a new Ability instance
   *
   * @param _template - ability's template
   * @param _ui       - UI component of the ability
   * @param _damage   - damage the ability deals
   */
  constructor(
    protected _template: EntityConfig,
    protected _ui: Renderable,
    protected _damage: Damage
  ) {
    super();
  }
}

export default Ability;
