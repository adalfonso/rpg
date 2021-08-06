import Damage from "./combat/Damage";
import InvalidDataError from "./error/InvalidDataError";
import StatModifier from "./combat/strategy/StatModifier";

/**
 * Different stat types
 */
export type Stat = "hp" | "atk" | "def" | "sp_atk" | "sp_def" | "spd";

/**
 * Anatomy of an entity's stats
 *
 * @prop hp     - base health
 * @prop atk    - physical attack
 * @prop def    - physical defense
 * @prop sp_atk - special attack
 * @prop sp_def - special defense
 * @prop spd    - speed
 */
export type StatTemplate = {
  [stat in Stat]: number;
};

/**
 * Template for export of gained experience data
 *
 * @prop exp    - amount of exp gained
 * @prop levels - listing of levels grown during experience gain
 */
type GainedExpSummary = {
  exp: number;
  levels: number[];
};

/**
 * Modifier to scale experience calculations down to a certain range
 */
const EXP_MODIFIER: number = 0.05;

/**
 * Max attainable level
 */
const MAX_LEVEL: number = 100;

/**
 * Actor's innate value
 *
 * Stats is in charge of maintaining the progression of an entity thoughout the
 * game. It increases the entity's abilities through stats and serves battle
 * functions by increasing the experience of the subject and yielding experience
 * points to other entitites that defeat the subject.
 */
export default class Stats {
  /**
   * Experience level of the entity
   */
  private _lvl: number;

  /**
   * Amount of damage currently inflicted on the entity
   */
  private _dmg: number = 0;

  /**
   * Amount of experience points the entity has gained between levels
   */
  private _exp: number;

  /**
   * Temporary modifications to the stats
   */
  private _modifiers: StatModifier[] = [];

  /**
   * Multiplier used to expand the range that base stats take
   */
  private multiplier: number = 2.5;

  /**
   * Create a new Stats instance
   *
   * @param base_stats - base stats for an entity
   */
  constructor(private base_stats: StatTemplate) {
    // Default to 5
    this._lvl = 5;
    this._exp = 0;
    this._dmg = 0;
  }

  /**
   * Get the current level
   */
  get lvl(): number {
    return this._lvl;
  }

  /**
   * Set the level stat
   *
   * NOTE: This is used to manually set the lvl. Lvl is normally increased as a
   * result of gainExp().
   *
   * @throws {InvalidDataError} when lvl input is invalid
   */
  set lvl(lvl: number) {
    if (lvl < 1 || lvl > 100 || !Number.isInteger(lvl)) {
      throw new InvalidDataError(`Invalid input when setting lvl stat: ${lvl}`);
    }

    this._lvl = lvl;
  }

  /**
   * Get the current damage
   */
  get dmg(): number {
    return this._dmg;
  }

  /**
   * Set the damage amount
   *
   * NOTE: This is used to manually set the dmg. If enduring dmg via battle or
   * some game mechanism, use endure().
   *
   * @throws {InvalidDataError} when dmg input is invalid
   */
  set dmg(dmg: number) {
    if (dmg < 0 || !Number.isInteger(dmg)) {
      throw new InvalidDataError(`Invalid input when setting dmg stat: ${dmg}`);
    }

    this._dmg = dmg;
  }

  /**
   * Get the amount of experience points
   */
  get exp(): number {
    return this._exp;
  }

  /**
   * Set the experience stat
   *
   * NOTE: This is used to manually set the exp. If gaining exp via battle or
   * some game mechanism, use gainExp().
   *
   * @throws {InvalidDataError} when exp input is invalid
   */
  set exp(exp: number) {
    if (exp < 0 || !Number.isInteger(exp) || exp > this.expToNextLevel()) {
      throw new InvalidDataError(`Invalid input when setting exp stat: ${exp}`);
    }

    this._exp = exp;
  }

  /**
   * Get the current health stat
   */
  get hp(): number {
    return Math.max(
      0,
      this.currentStatValue(this.base_stats.hp) * this._getModifier("hp") -
        this._dmg
    );
  }

  /**
   * Get the current physical attack stat
   */
  get atk(): number {
    return (
      this.currentStatValue(this.base_stats.atk) * this._getModifier("atk")
    );
  }

  /**
   * Get the current physical defense stat
   */
  get def(): number {
    return (
      this.currentStatValue(this.base_stats.def) * this._getModifier("def")
    );
  }

  /**
   * Get the current special attack stat
   */
  get sp_atk(): number {
    return (
      this.currentStatValue(this.base_stats.sp_atk) *
      this._getModifier("sp_atk")
    );
  }

  /**
   * Get the current special defense stat
   */
  get sp_def(): number {
    return (
      this.currentStatValue(this.base_stats.sp_def) *
      this._getModifier("sp_def")
    );
  }

  /**
   * Get the current speed stat
   */
  get spd(): number {
    return (
      this.currentStatValue(this.base_stats.spd) * this._getModifier("spd")
    );
  }

  /**
   * Get the experience yield from defeating the subject
   */
  get givesExp(): number {
    return this.currentStatValue(
      this.base_stats.hp +
        this.base_stats.atk +
        this.base_stats.def +
        this.base_stats.sp_atk +
        this.base_stats.sp_def +
        this.base_stats.spd
    );
  }

  /**
   * Damage the subject
   *
   * @param damage - amount of damage
   */
  public endure(damage: Damage) {
    const defense = damage.isSpecial ? this.sp_def : this.def;

    this._dmg += Math.max(1, damage.value - defense);
  }

  /**
   * Increase the subject's experience points
   *
   * @param exp - points of experience earned
   *
   * @return - experience data
   */
  public gainExp(exp: number): GainedExpSummary {
    this._exp += exp;

    let data: GainedExpSummary = {
      exp: exp,
      levels: [],
    };

    while (this.gainLevel()) {
      data.levels.push(this._lvl);
    }

    return data;
  }

  /**
   * Apply a temporary stat modifier
   *
   * @param modifier - modifier to apply
   */
  public modify(modifier: StatModifier) {
    this._modifiers.push(modifier);
  }

  /**
   * Cycle modifiers once and discard any that have expired
   */
  public expireModifiers() {
    this._modifiers = this._modifiers.filter((m) => !m.consume());
  }

  /**
   * Gain a level if the experience has been earned
   *
   * @return if a level increased
   */
  private gainLevel(): boolean {
    let experienceNeeded = this.expToNextLevel();

    if (this._exp < experienceNeeded) {
      return false;
    }

    this._exp -= experienceNeeded;
    this._lvl++;

    return true;
  }

  /**
   * Get numeric modifer for a stat
   *
   * @param stat - stat type
   *
   * @return modifier
   */
  private _getModifier(stat: Stat): number {
    return (
      1 +
      this._modifiers
        .filter((m) => m.stat === stat)
        .reduce((carry: number, m: StatModifier) => {
          return carry + m.value;
        }, 0)
    );
  }

  /**
   * Adjust a base stat based on current conditions
   *
   * @param baseStat - base state to adjust
   *
   * @return adjusted stat value
   */
  private currentStatValue(baseStat: number): number {
    return Math.floor(((baseStat * this._lvl) / 100) * this.multiplier);
  }

  /**
   * Get the amount of experience required to grow a level
   *
   * @param lvl - level to grow
   */
  private expToNextLevel(lvl = this._lvl): number {
    if (this._lvl >= MAX_LEVEL) {
      return Infinity;
    }

    return Math.ceil(
      Math.pow(lvl, 1.5) * this.getBaseStateTotal() * EXP_MODIFIER
    );
  }

  /**
   * Sum all the base stats
   *
   * @return total of base stats
   */
  private getBaseStateTotal(): number {
    return Object.keys(this.base_stats).reduce((carry, stat) => {
      return carry + this.base_stats[stat];
    }, 0);
  }
}
