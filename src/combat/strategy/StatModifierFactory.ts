import MissingDataError from "@/error/MissingDataError";
import RenderableFactory from "@/ui/RenderableFactory";
import StatModifier from "./StatModifier";
import { abilities } from "./abilities";

class StatModifierFactory {
  /**
   * Create a new stat modifier
   *
   * @param ref - lookup name of ability/modification
   *
   * @throws {MissingDataError} when it fails to lookup the ability/modification
   *
   * @return the ability/modification
   */
  public createModifier(ref: string): StatModifier {
    const template = abilities().stat[ref];

    if (!template) {
      throw new MissingDataError(
        `Unable to find item "${ref}" when creating a stat modifier.`
      );
    }

    const ui = RenderableFactory.createRenderable(template.ui.sprite);

    return new StatModifier(template, ref, ui);
  }
}

export default StatModifierFactory;
