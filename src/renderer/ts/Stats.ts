import { bus } from "./EventBus";

/**
 * Anatomy of an entity's stats
 *
 * @type {StatTemplate}
 *
 * @prop {number} hp     Base health
 * @prop {number} atk    Physical attack
 * @prop {number} def    Physical defense
 * @prop {number} sp_atk Magic attack
 * @prop {number} sp_def Magic defense
 * @prop {number} spd    Speed
 */
export type StatTemplate = {
  hp: number;
  atk: number;
  def: number;
  sp_atk: number;
  sp_def: number;
  spd: number;
};

/**
 * Modifier to scale experience calculations down to a certain range
 *
 * @constant {number} EXP_MODIFER
 */
const EXP_MODIFIER = 0.05;

/**
 * Max attainable level
 *
 * @constant {number} MAX_LEVEL
 */
const MAX_LEVEL = 100;

/**
 * Stats is in charge of maintaining the progression of an entity thoughout the
 * game. It increases the entity's abilities through stats and serves battle
 * functions by increasing the experience of the subject and yielding experience
 * points to other entitites that defeat the subject.
 */
export default class Stats {
  /**
   * Experience level of the entity
   *
   * @prop {number} _lvl
   */
  private _lvl: number;

  /**
   * Amount of damage currently inflicted on the entity
   *
   * @prop {number} _dmg
   */
  private _dmg: number = 0;

  /**
   * Amount of experience points the entity has gained between levels
   *
   * @prop {number} _exp
   */
  private _exp: number;

  /**
   * Base stats of an entity
   *
   * @prop {StatTemplate} baseStats
   */
  private baseStats: StatTemplate;

  /**
   * Multiplier used to expand the range that base stats take
   *
   * @prop {number} multiplier
   */
  private multiplier: number = 2.5;

  /**
   * Create a new Stats instance
   *
   * @param {StatTemplate} stats Base stats for an entity
   */
  constructor(stats: StatTemplate) {
    this.baseStats = stats;

    // Default to 5
    this._lvl = 5;
    this._exp = 0;
    this._dmg = 0;
  }

  /**
   * Get the current level
   *
   * @return {number} Current level stat
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
   * @param {number} lvl Lev
   * el to set
   */
  set lvl(lvl: number) {
    if (lvl < 1 || lvl > 100 || !Number.isInteger(lvl)) {
      throw new Error(`Invalid input when setting lvl stat: ${lvl}`);
    }

    this._lvl = lvl;
  }

  /**
   * Get the current damage
   *
   * @return {number} Current damage
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
   * @param {number} dmg Damage to set
   */
  set dmg(dmg: number) {
    if (dmg < 0 || !Number.isInteger(dmg)) {
      throw new Error(`Invalid input when setting dmg stat: ${dmg}`);
    }

    this._dmg = dmg;
  }

  /**
   * Get the amount of experience points
   *
   * @return {number} Current experience points
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
   * @param {number} lvl Level to set
   */
  set exp(exp: number) {
    if (exp < 0 || !Number.isInteger(exp) || exp > this.expToNextLevel()) {
      throw new Error(`Invalid input when setting exp stat: ${exp}`);
    }

    this._exp = exp;
  }

  /**
   * Get the current health stat
   *
   * @return {number} Current health stat
   */
  get hp(): number {
    return Math.max(0, this.currentStatValue(this.baseStats.hp) - this._dmg);
  }

  /**
   * Get the current physical attack stat
   *
   * @return {number} Current physical attack stat
   */
  get atk(): number {
    return this.currentStatValue(this.baseStats.atk);
  }

  /**
   * Get the current physical defense stat
   *
   * @return {number} Current physical defense stat
   */
  get def(): number {
    return this.currentStatValue(this.baseStats.def);
  }

  /**
   * Get the current magic attack stat
   *
   * @return {number} Current magic attack stat
   */
  get sp_atk(): number {
    return this.currentStatValue(this.baseStats.sp_atk);
  }

  /**
   * Get the current magic defense stat
   *
   * @return {number} Current magic defense stat
   */
  get sp_def(): number {
    return this.currentStatValue(this.baseStats.sp_def);
  }

  /**
   * Get the current speed stat
   *
   * @return {number} Current speed stat
   */
  get spd(): number {
    return this.currentStatValue(this.baseStats.spd);
  }

  /**
   * Get the experience yield from defeating the subject
   *
   * @return {number} Experience yield
   */
  get givesExp(): number {
    return this.currentStatValue(
      this.baseStats.hp +
        this.baseStats.atk +
        this.baseStats.def +
        this.baseStats.sp_atk +
        this.baseStats.sp_def +
        this.baseStats.spd
    );
  }

  /**
   * Damage the subject
   *
   * @param {number} dmg Amount of damage
   */
  public endure(dmg: number) {
    this._dmg += Math.max(1, dmg - this.def);
  }

  /**
   * Increase the subject's experience points
   *
   * @param {number} exp Points of experience earned
   *
   * @emits stats.gainExp
   */
  public gainExp(exp: number) {
    this._exp += exp;

    let detail = {
      exp: exp,
      lvl: null,
      manager: this,
    };

    while (this.gainLevel()) {
      detail.lvl = this._lvl;
    }

    bus.emit("stats.gainExp", detail);
  }

  /**
   * Gain a level if the experience has been earned
   *
   * @return {boolean} If a level increased
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
   * Adjust a base stat based on current conditions
   *
   * @param  {number} baseStat Base state to adjust
   *
   * @return {number}          Adjusted stat value
   */
  private currentStatValue(baseStat: number): number {
    return Math.floor(((baseStat * this._lvl) / 100) * this.multiplier);
  }

  /**
   * Get the amount of experience required to grow a level
   *
   * @param {number} lvl Level to grow
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
   * @return {number} Total of base stats
   */
  private getBaseStateTotal(): number {
    return Object.keys(this.baseStats).reduce((carry, stat) => {
      return carry + this.baseStats[stat];
    }, 0);
  }
}
