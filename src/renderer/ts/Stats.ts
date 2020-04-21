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
  private lvl: number;

  /**
   * Amount of damage currently inflicted on the entity
   *
   * @prop {number} dmg
   */
  private dmg: number;

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
  private stats: Stats;

  /**
   * Create a new StatsManager instance
   *
   * @param {Stats} stats Base stats for an entity
   */
  constructor(stats: Stats) {
    this.stats = stats;

    this.lvl = 1;
    this.exp = 0;
    this.dmg = 0;
  }

  /**
   * Get the current health stat
   *
   * @return {number} Current health stat
   */
  get hp(): number {
    return Math.max(0, this.stats.hp - this.dmg);
  }

  /**
   * Get the current physical attack stat
   *
   * @return {number} Current physical attack stat
   */
  get atk(): number {
    return this.stats.atk;
  }

  /**
   * Get the current physical defense stat
   *
   * @return {number} Current physical defense stat
   */
  get def(): number {
    return this.stats.def;
  }

  /**
   * Get the current magic attack stat
   *
   * @return {number} Current magic attack stat
   */
  get sp_atk(): number {
    return this.stats.sp_atk;
  }

  /**
   * Get the current magic defense stat
   *
   * @return {number} Current magic defense stat
   */
  get sp_def(): number {
    return this.stats.sp_def;
  }

  /**
   * Get the current speed stat
   *
   * @return {number} Current speed stat
   */
  get spd(): number {
    return this.stats.spd;
  }

  /**
   * Get the experience yield from defeating the subject
   *
   * @return {number} Experience yield
   */
  get givesExp(): number {
    return (
      this.stats.hp +
      this.stats.atk +
      this.stats.def +
      this.stats.sp_atk +
      this.stats.sp_def +
      this.stats.spd
    );
  }

  /**
   * Damage the subject
   *
   * @param {number} dmg Amount of damage
   */
  public endure(dmg: number) {
    this.dmg += dmg;
  }

  /**
   * Increase the subject's experience points
   *
   * @param {number} exp Points of experience earned
   */
  public gainExp(exp: number) {
    this.exp += exp;
  }
}
