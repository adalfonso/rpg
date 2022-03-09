import Stats from "@/Stats";
import { DamageType } from "./types";

/** A compact summary of damage */
class Damage {
  /**
   * Create a new damage instance
   *
   * @param _value - the amount of damage to deal
   * @param _type  - the type of damage dealt
   */
  constructor(private _value: number, private _type: DamageType) {}

  /** Determine if the damage dealt is special */
  get isSpecial(): boolean {
    return this._type === "special";
  }

  /** Get the amount of damage dealt */
  get value(): number {
    return this._value;
  }

  /**
   * Augment damage amount by stats
   *
   * @param stats - stats to augment by
   *
   * @return resulting damage
   */
  public augment(stats: Stats): Damage {
    const baseDamage = this.isSpecial ? stats.sp_atk : stats.atk;

    return new Damage(this._value + baseDamage, this._type);
  }
}

export default Damage;
