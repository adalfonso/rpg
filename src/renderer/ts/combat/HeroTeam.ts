import Actor from "@/actor/Actor";
import MissingDataError from "@/error/MissingDataError";
import Player from "@/actor/Player";
import Team from "./Team";
import Vector from "@common/Vector";
import { CallableMap, Eventful } from "@/interfaces";
import { bus } from "@/EventBus";

/**
 * Similar to a Team but specific to playable characters
 */
class HeroTeam extends Team<Player> implements Eventful {
  /**
   * Create a new HeroTeam instance
   *
   * @param _members - heroes
   */
  constructor(protected _members: Player[]) {
    super(_members);

    bus.register(this);
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
    return {
      "team.newMember": (e: CustomEvent) => {
        const actor = e.detail?.target.actor;

        if (!actor || !(actor instanceof Actor)) {
          throw new MissingDataError(
            `Could not locate team member when adding a new one to the hero team`
          );
        }

        const member = new Player(
          new Vector(0, 0),
          // TODO: why do we have to provide a size if it is listed in the template?
          new Vector(actor.template.width, actor.template.height),
          actor.template
        );

        this.add(member);
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
}

export default HeroTeam;
