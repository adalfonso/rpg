import * as ex from "excalibur";
import MissingDataError from "@/error/MissingDataError";
import { Actor } from "@/actor/Actor";
import { Direction } from "@/ui/types";

/** A battle-centric collection of actors that are related in some way */
class Team<M extends Actor> {
  /** Team members that have taken their turn */
  private _have_taken_turn: M[] = [];

  /**
   * Create a new Team instance
   *
   * @param _members - members of the team
   */
  constructor(protected _members: M[]) {
    if (_members.length === 0) {
      throw new MissingDataError(`Cannot create a team without any members`);
    }
  }

  /** Determine if all team members are defeated */
  get areDefeated() {
    return this._members.filter((member) => !member.isDefeated).length === 0;
  }

  /** Get the total exp yield from defeating the team */
  get givesExp() {
    return this._members.reduce((carry, member) => {
      return carry + member.stats.givesExp;
    }, 0);
  }

  /** Get the team leader */
  get leader() {
    return this._members[0];
  }

  /** Get the length of the team */
  get length() {
    return this._members.length;
  }

  /**
   * Add a new member to the team
   *
   * @param member - member instance
   */
  public add(member: M) {
    this._members = [...this._members, member];
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
    offset: ex.Vector,
    resolution: ex.Vector
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
  public prepare(direction: Direction, position: ex.Vector) {
    this._members.forEach((member, index) => {
      // TODO: Look into a general save method instead
      member.savePosition();
      member.saveDirection();
      member.direction = direction;
      member.moveTo(position.add(new ex.Vector(member.size.x * index * 4, 0)));
      member.lock();
    });
    this.cycle();
  }

  /**
   * Determine if there is only one member left on the team
   *
   * @return if there is only one undefeated member on the team
   */
  public hasLastManStanding() {
    return this._members.filter((member) => !member.isDefeated).length === 1;
  }

  /** Handle actions after a combat cycle has ended */
  public cycle() {
    this._members.forEach((m) => m.stats.expireModifiers());
    this._have_taken_turn = [];
  }

  /**
   * Impose an action on each team member
   *
   * @param callable - action for each team member
   */
  public each(callable: (member: M, index: number) => void) {
    this._members.forEach((member, index) => {
      callable(member, index);
    });
  }

  /**
   * Get all the team members
   *
   * @return all team members
   */
  public all(): M[] {
    return this._members;
  }

  /**
   * Take a turn for a team member
   *
   * @param member - team member who is taking their turn
   */
  public takeTurn(member: M) {
    if (!this._members.includes(member)) {
      throw new Error("Tried to take turn for actor who is not on this team");
    }

    this._have_taken_turn = [...this._have_taken_turn, member];
  }

  /** Determine if the turn is over */
  get turnIsOver() {
    return (
      this._members
        .filter((member) => !member.isDefeated)
        .filter((member) => !this._have_taken_turn.includes(member)).length ===
      0
    );
  }

  /** Determine the next member to take their turn */
  get nextToTakeTurn() {
    return (
      this._members.filter(
        (member) =>
          !member.isDefeated && !this._have_taken_turn.includes(member)
      )[0] ?? this.leader
    );
  }

  /** Determine the previous member to take their turn */
  get previousToTakeTurn() {
    return [...this._have_taken_turn].pop();
  }
}

export default Team;
