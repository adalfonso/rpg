import CombatStrategy from "./CombatStrategy";
import CombatStrategyFactory from "./CombatStrategyFactory";
import MissingDataError from "@/error/MissingDataError";
import Weapon from "./Weapon";
import items from "@/item/items.ts";

class WeaponFactory implements CombatStrategyFactory {
  /**
   * Create a new weapon combat strategy
   *
   * @param ref - lookup name of weapon
   *
   * @throws {MissingDataError} when it fails to lookup the weapon
   *
   * @return the weapon
   */
  public createStrategy(ref: string): CombatStrategy {
    let template = items[ref];

    if (!template) {
      throw new MissingDataError(
        `Unable to find item "${ref}" when creating a weapon.`
      );
    }

    return new Weapon(template, ref);
  }
}

export default WeaponFactory;
