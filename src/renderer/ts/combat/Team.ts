import Actor from "@/actors/Actor";
import MissingDataError from "@/error/MissingDataError";

/**
 * A team is a battle-centric collection of actors that are related in some way
 */
class Team {
  /**
   * Create a new Team instance
   *
   * @param _members
   */
  constructor(protected _members: Actor[]) {
    if (_members.length === 0) {
      throw new MissingDataError(`Cannot create a team without any members`);
    }
  }

  /**
   * Determine if all team members are defeated
   *
   * @return {boolean} Members are defeated
   */
  get areDefeated(): boolean {
    return this._members.filter((member) => member.stats.hp > 0).length === 0;
  }

  /**
   * Get the total exp yield from defeating the team
   *
   * @return {number} Exp yield
   */
  get givesExp(): number {
    return this._members.reduce((carry, member) => {
      return carry + member.stats.givesExp;
    }, 0);
  }

  /**
   * Get the team leader
   *
   * @return {Actor} Team leader
   */
  get leader(): Actor {
    return this._members[0];
  }

  /**
   * Get the length of the team
   *
   * @return {boolean} Team length
   */
  get length(): number {
    return this._members.length;
  }

  /**
   * Impose an action on each team member
   *
   * @param {Function} callable Action for each team member
   */
  public each(callable: Function) {
    this._members.forEach((member: Actor) => {
      callable(member);
    });
  }

  /**
   * Get all the team members
   *
   * @return {Actor[]} All team members
   */
  public all(): Actor[] {
    return this._members;
  }
}

export default Team;
