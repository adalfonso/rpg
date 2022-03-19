import CombatStrategyFactory from "./CombatStrategyFactory";
import Damage from "../Damage";
import MissingDataError from "@/error/MissingDataError";
import RenderableFactory from "@/ui/RenderableFactory";
import Weapon from "./Weapon";
import items from "@/item/items";

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
  public createStrategy(ref: string) {
    const template = items[ref];

    if (!template) {
      throw new MissingDataError(
        `Unable to find item "${ref}" when creating a weapon.`
      );
    }

    const ui = RenderableFactory.createRenderable(template.ui.sprite);
    const damage = new Damage(template.value, "physical");

    return new Weapon(template, ui, damage, ref);
  }
}

export default WeaponFactory;
