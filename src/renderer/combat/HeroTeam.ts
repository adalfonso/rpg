import Actor from "@/actor/Actor";
import MissingDataError from "@/error/MissingDataError";
import Player from "@/actor/Player";
import Team from "./Team";
import Vector from "@common/Vector";
import config from "@/config";
import { LevelFixtureTemplate } from "@/level/LevelFixture";
import { Stateful } from "@/interfaces";
import { TeamState } from "./types";
import { bus, EventType } from "@/EventBus";
import { isTeamState } from "@schema/combat/TeamSchema";
import { state } from "@/state/StateManager";

/** Similar to a Team but specific to playable characters */
export class HeroTeam extends Team<Player> implements Stateful<TeamState> {
  /**
   * Create a new HeroTeam instance
   *
   * @param _members - heroes
   */
  constructor(protected _members: Player[]) {
    super(_members);

    this._resolveState();

    bus.register(this);
  }

  /** State lookup key */
  get state_ref() {
    return "team";
  }

  /** Current data state */
  get state() {
    return this._members.map((member) => member.state);
  }

  /**
   * Add a new member to the team
   *
   * @param member - member instance
   */
  public add(member: Player) {
    super.add(member);

    state().mergeByRef(this.state_ref, this.state);
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register() {
    return {
      [EventType.Custom]: {
        "team.newMember": (e: CustomEvent) => {
          const actor = e.detail?.target.actor;

          if (!actor || !(actor instanceof Actor)) {
            throw new MissingDataError(
              `Could not locate team member when adding a new one to the hero team`
            );
          }

          this.add(this._createPlayerFromActor(actor));
        },
      },
    };
  }

  /**
   * Gain exp for the whole team
   *
   * The number of exp points are split equally amonst the team members.
   *
   * @param exp - experience points
   */
  public gainExp(exp: number) {
    this._members.forEach((member) =>
      member.gainExp(Math.ceil(exp / this._members.length))
    );
  }

  /**
   * Resolve the current state of the team in comparison to the game state
   *
   * @param ref - reference to where in the state the team is stored
   *
   * @return actor data as stored in the state
   */
  private _resolveState() {
    const data = state().resolve(this, isTeamState);

    const refs = this.all().map((member) => member.state_ref);

    for (const member of data) {
      if (refs.includes(member.type)) {
        continue;
      }

      // TODO: Remove this hack
      const placeholder = new Player(
        Vector.empty(),
        new Vector(16, 32).times(config.scale),
        member as unknown as LevelFixtureTemplate
      );

      this.add(placeholder);
    }

    return data;
  }

  /**
   * Create a new Player from some Actor instance
   *
   * TODO: this does not belong here
   *
   * @param actor - Actor instance
   *
   * @returns new player
   */
  private _createPlayerFromActor(actor: Actor) {
    const position = Vector.empty();
    const size = new Vector(actor.template.width, actor.template.height);

    return new Player(
      position.times(config.scale),
      // TODO: why do we have to provide a size if it is listed in the template?
      size.times(config.scale),
      actor.template
    );
  }
}
