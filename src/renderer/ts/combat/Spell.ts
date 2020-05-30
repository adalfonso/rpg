import CombatStrategy, { UiData } from "./CombatStrategy";

/**
 * Data required to instantiate a spell
 */
type SpellTemplate = {
  displayAs: string;
  description: string;
  value: number;
  special: boolean;
  ui?: UiData;
};

/**
 * Techniques used by the player to deal damage against an entity
 */
class Spell extends CombatStrategy {
  /**
   * Whether the spell deals special damage
   */
  private _special: boolean;

  /**
   * Create a new Spell instance
   *
   * @param template - spell data
   */
  constructor(template: SpellTemplate) {
    super(template);

    this._special = template.special;
  }
}

export default Spell;
