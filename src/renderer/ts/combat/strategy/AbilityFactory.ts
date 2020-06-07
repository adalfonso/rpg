import Ability from "./Ability";
import CombatStrategy from "./CombatStrategy";
import CombatStrategyFactory from "./CombatStrategyFactory";
import MissingDataError from "@/error/MissingDataError";
import abilities from "@/combat/strategy/abilities";

class AbilityFactory implements CombatStrategyFactory {
  /**
   * Create a new ability combat strategy
   *
   * @param ref - lookup name of ability
   *
   * @throws {MissingDataError} when it fails to lookup the ability
   *
   * @return the ability
   */
  public createStrategy(ref: string): CombatStrategy {
    let template = abilities[ref];

    if (!template) {
      throw new MissingDataError(
        `Unable to find ability "${ref}" when creating an ability.`
      );
    }

    return new Ability(template);
  }
}

export default AbilityFactory;
