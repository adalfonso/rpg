import Renderable from "@/ui/Renderable";
import { Descriptive, Visual } from "./CombatStrategy";
import { Stat } from "@/Stats";
import { StatModifierTemplate } from "./types";
import { bus } from "@/EventBus";
import { Empty } from "@/mixins";

/**
 * Temporary modifications made to an actor's stats
 */
class StatModifier extends Descriptive(Visual(Empty)) {
  /**
   * Number of turns this effect has taken effect
   */
  private _turnsApplied = 0;

  /** TODO: eslint artifact. this was added as a hack to satisfy an interface */
  public type = "u got hacked bro";

  /**
   * Create a new StatModifier instance
   *
   * @param _template - modification's template
   * @param _ui       - UI component for the modification
   */
  constructor(
    protected _template: StatModifierTemplate,
    protected _ui: Renderable
  ) {
    super();
  }

  /**
   * Determine if the effect will apply to the user
   */
  get appliesToSelf(): boolean {
    return this._template.self;
  }

  /**
   * Get the stat type that the modification affects
   */
  get stat(): Stat {
    return this._template.stat;
  }

  /**
   * Get the numeric value of the modification
   */
  get value(): number {
    return this._template.value;
  }

  /**
   * Use the modification in battle
   *
   * @emits battle.action
   */
  public use() {
    bus.emit("battle.action", { modifier: this });
  }

  /**
   * Consume a single use (turn) of the modification
   *
   * @return if the modification has expired
   */
  public consume(): boolean {
    this._turnsApplied++;

    return this._turnsApplied >= this._template.duration;
  }
}

export default StatModifier;
