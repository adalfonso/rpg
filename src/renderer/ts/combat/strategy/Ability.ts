import CombatStrategy from "./CombatStrategy";
import { AbilityTemplate } from "./types";

/**
 * Technique learned by an actor
 */
class Ability extends CombatStrategy {
  /**
   * If the ability relates to sp_atk/sp_def
   */
  private _isSpecial: boolean;

  /**
   * Create a new Ability instance
   *
   * @param template - weapon template
   */
  constructor(template: AbilityTemplate) {
    super(template);

    this._isSpecial = template.isSpecial;
  }
}

export default Ability;
