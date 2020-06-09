import Ability from "./Ability";
import CombatStrategyFactory from "./CombatStrategyFactory";
import Damage from "../Damage";
import MissingDataError from "@/error/MissingDataError";
import RenderableFactory from "@/ui/RenderableFactory";
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
  public createStrategy(ref: string): Ability {
    let template = abilities[ref];

    if (!template) {
      throw new MissingDataError(
        `Unable to find ability "${ref}" when creating an ability.`
      );
    }

    const ui = RenderableFactory.createRenderable(template.ui.sprite);

    const damage = new Damage(
      template.value,
      template.isSpecial ? "special" : "physical"
    );

    return new Ability(template, ui, damage);
  }
}

export default AbilityFactory;
