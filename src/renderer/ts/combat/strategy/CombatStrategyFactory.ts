import CombatStrategy from "./CombatStrategy";

interface CombatStrategyFactory {
  /**
   * Create a specific type of combat strategy
   *
   * @param ref - name reference to the strategy
   *
   * @return the strategy
   */
  createStrategy(ref: string): CombatStrategy;
}

export default CombatStrategyFactory;
