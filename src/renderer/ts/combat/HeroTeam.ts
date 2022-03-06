import Actor from "@/actor/Actor";
import MissingDataError from "@/error/MissingDataError";
import Player from "@/actor/Player";
import Team from "./Team";
import Vector from "@common/Vector";
import config from "@/config";
import { bus, EventType } from "@/EventBus";

/** Similar to a Team but specific to playable characters */
class HeroTeam extends Team<Player> {
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

          const position = Vector.empty();
          const size = new Vector(actor.template.width, actor.template.height);

          const member = new Player(
            position.times(config.scale),
            // TODO: why do we have to provide a size if it is listed in the template?
            size.times(config.scale),
            actor.template
          );

          this.add(member);
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
}

export default HeroTeam;
