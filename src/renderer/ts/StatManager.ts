/**
 * Anatomy of an entity's stats
 *
 * @type {Stats}
 *
 * @prop {number} hp     Base health
 * @prop {number} atk    Physical attack
 * @prop {number} def    Physical defense
 * @prop {number} sp_atk Magic attack
 * @prop {number} sp_def Magic defense
 * @prop {number} spd    Speed
 */
export type Stats = {
  hp: number;
  atk: number;
  def: number;
  sp_atk: number;
  sp_def: number;
  spd: number;
};

/**
 * StatsManager is in charge of maintaining the progression of an entity
 * thoughout the game. It increases the entity's abilities through stats and
 * serves battle functions by increasing the experience of the subject and
 * yielding experience points to other entitites that defeat the subject
 */
export default class StatManager {
  /**
   * Experience level of the entity
   *
   * @prop {number} lvl
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
   * @prop {number} exp
   */
  private exp: number;

  /**
   * Base stats of an entity
   *
   * @prop {Stats} stats
   */
  private baseStats: Stats;

  /**
   * Multiplier used to expand the range that base stats take
   *
   * @prop {number} multiplier
   */
  private multiplier: number = 2.5;

  /**
   * Create a new StatsManager instance
   *
   * @param {Stats} stats Base stats for an entity
   */
  constructor(stats: Stats) {
    this.baseStats = stats;

    // Default to 5
    this._lvl = 5;
    this.exp = 0;
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
   * @param {number} lvl Level to set
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
   * @param {number} dmg Damage to set
   */
  set dmg(dmg: number) {
    if (dmg < 0 || !Number.isInteger(dmg)) {
      throw new Error(`Invalid input when setting dmg stat: ${dmg}`);
    }

    this._dmg = dmg;
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
   */
  public gainExp(exp: number) {
    this.exp += exp;
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
}
