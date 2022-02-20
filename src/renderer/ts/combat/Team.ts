import Actor from "@/actor/Actor";
import MissingDataError from "@/error/MissingDataError";
import Vector from "@common/Vector";
import { Direction } from "@/ui/types";

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
    return this._members.filter((member) => !member.isDefeated).length === 0;
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
    this._members
      .filter((member) => !member.isDefeated)
      .forEach((member) => member.draw(ctx, offset, resolution));
  }

  /**
   * Prepare the team's positioning for battle
   *
   * @param direction - direction members will face
   * @param position  - position members are moved to
   */
  public prepare(direction: Direction, position: Vector) {
    this._members.forEach((member: Actor, index: number) => {
      member.savePosition(true);
      member.direction = direction;
      member.moveTo(position.plus(new Vector(member.size.x * index * 4, 0)));
      member.lock();
    });
  }

  /**
   * Determine if there is only one member left on the team
   *
   * @return if there is only one undefeated member on the team
   */
  public hasLastManStanding(): boolean {
    return this._members.filter((member) => !member.isDefeated).length === 1;
  }

  /**
   * Handle actions after a combat cycle has ended
   */
  public cycle() {
    this._members.forEach((m: Actor) => m.stats.expireModifiers());
  }

  /**
   * Impose an action on each team member
   *
   * @param callable - action for each team member
   */
  public each(callable: (member: Actor, index: number) => void) {
    this._members.forEach((member, index) => {
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
