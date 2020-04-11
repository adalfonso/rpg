export default class Stats {
  public lvl: number;
  public damage: number;
  protected experience: number;
  protected base_hp: number;
  protected base_atk: number;
  protected base_def: number;
  protected base_sp_atk: number;
  protected base_sp_def: number;
  protected base_spd: number;

  constructor(stats: object) {
    for (let stat in stats) {
      this["base_" + stat] = stats[stat];
    }

    this.lvl = 1;
    this.experience = 0;
    this.damage = 0;
  }

  get hp(): number {
    return Math.max(0, this.base_hp - this.damage);
  }

  get atk(): number {
    return this.base_atk;
  }
  get def(): number {
    return this.base_def;
  }
  get sp_atk(): number {
    return this.base_sp_atk;
  }
  get sp_def(): number {
    return this.base_sp_def;
  }
  get spd(): number {
    return this.base_spd;
  }

  get givesExperience(): number {
    return (
      this.base_hp +
      this.base_atk +
      this.base_def +
      this.base_sp_atk +
      this.base_sp_def +
      this.base_spd
    );
  }

  endure(damage: number) {
    this.damage += damage;
  }

  gainExperience(exp: number) {
    this.experience += exp;
  }
}
