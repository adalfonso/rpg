import Weapon from "./strategy/Weapon";
import { Actor } from "@/actor/Actor";
import { HeroTeam } from "./HeroTeam";

/**
 * Sets up Equippers for an entire team
 *
 * This class is functionaly a SubMenu used to manage the underlying assets for
 * inventory equipping.
 **/
export class TeamEquipper {
  /** Menu items */
  private _equippers: Map<string, Equipper> = new Map();

  /**
   * @param _team  team of actors who may be equipped with an item
   * @param _weapon an item that may be equipped
   */
  constructor(private _team: HeroTeam, public _weapon: Weapon) {}

  /** Obligatory menu to SubMenu pattern */
  get menu() {
    this._refresh();

    return Array.from(this._equippers.values());
  }

  /** Add any new team members to the equipper map */
  private _refresh() {
    this._team.each((actor) => {
      if (this._equippers.has(actor.ref)) {
        return;
      }

      // TODO: Should this be keyed of state_ref, or will only actors hole equipment?
      this._equippers.set(actor.ref, new Equipper(actor, this._weapon));
    });
  }
}

/** Manages equipment relationship between an actor and a weapon */
export class Equipper {
  /**
   * @param _actor actor that might be equipped with the weapon
   * @param _weapon wepaon to equip
   */
  constructor(private _actor: Actor, private _weapon: Weapon) {}

  /** Equip the weapon to the actor */
  public equip() {
    const { _weapon: equipment, _actor: actor } = this;
    const is_owner = actor.weapon === equipment;

    equipment.unequip();

    // Already equipped to this actor
    if (is_owner) {
      return;
    }

    equipment.equip(actor);
  }

  get actor() {
    return this._actor;
  }

  get ref() {
    return this._actor.state_ref;
  }

  get displayAs() {
    const equipped = this._actor.weapon === this._weapon;
    return this._actor.displayAs + (equipped ? "   (equipped)" : "");
  }
}
