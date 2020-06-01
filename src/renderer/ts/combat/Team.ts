import Actor from "@/actors/Actor";
import MissingDataError from "@/error/MissingDataError";
import Vector from "@common/Vector";

/**
 * A battle-centric collection of actors that are related in some way
 */
class Team {
  /**
   * Create a new Team instance
   *
   * @param _members - members of the team
   */
  constructor(protected _members: Actor[]) {
    if (_members.length === 0) {
      throw new MissingDataError(`Cannot create a team without any members`);
    }
  }

  /**
   * Determine if all team members are defeated
   */
  get areDefeated(): boolean {
    return this._members.filter((member) => member.stats.hp > 0).length === 0;
  }

  /**
   * Get the total exp yield from defeating the team
   */
  get givesExp(): number {
    return this._members.reduce((carry, member) => {
      return carry + member.stats.givesExp;
    }, 0);
  }

  /**
   * Get the team leader
   */
  get leader(): Actor {
    return this._members[0];
  }

  /**
   * Get the length of the team
   */
  get length(): number {
    return this._members.length;
  }

  /**
   * Draw opponent select
   *
   * @param ctx        - render context
   * @param offset     - render position offset
   * @param resolution - render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    this._members.forEach((member: Actor, index: number) => {
      member.draw(ctx, offset, resolution);
    });
  }

  /**
   * Prepare the team's positioning for battle
   *
   * @param direction - direction members will face
   * @param position  - position members are moved to
   */
  public prepare(direction: number, position: Vector) {
    this._members.forEach((member: Actor, index: number) => {
      member.savePosition();
      member.direction = direction;
      member.position = position.plus(new Vector(member.size.x * index * 4, 0));
      member.lock();
    });
  }

  /**
   * Impose an action on each team member
   *
   * @param callable - action for each team member
   */
  public each(callable: Function) {
    this._members.forEach((member: Actor, index: number) => {
      callable(member, index);
    });
  }

  /**
   * Get all the team members
   *
   * @return all team members
   */
  public all(): Actor[] {
    return this._members;
  }
}

export default Team;
