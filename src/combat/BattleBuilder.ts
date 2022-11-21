import * as ex from "excalibur";
import Battle from "./Battle";
import MissingDataError from "@/error/MissingDataError";
import Team from "./Team";
import { AnimatedTextFactory } from "@/ui/animation/text/AnimatedTextFactory";
import { Enemy } from "@/actor/Enemy";
import { HeroTeam } from "./HeroTeam";
import { OpponentSelect } from "./OpponentSelect";
import { config } from "./battle_config";

/** Blueprint for an enemy team */
type TeamBlueprint = {
  limit: number[];
  include: string[];
  require: string[];
};

class BattleBuilder {
  /**
   * Create a battle from a battle event
   *
   * @param heroes - hero team
   * @param enemy - enemy to fight
   * @return battle instance
   */
  public static async create(
    heroes: HeroTeam,
    enemy: Enemy,
    engine: ex.Engine
  ): Promise<Battle> {
    const builder = new BattleBuilder();
    const enemyTeam = await builder._createTeamFromEnemy(enemy);
    const resolution = engine.screen.resolution;

    return new Battle(
      heroes,
      enemyTeam,
      new OpponentSelect(enemyTeam),
      ex.vec(resolution.width, resolution.height),
      AnimatedTextFactory.createStartBattleAnimation()
    );
  }

  /**
   * Create an enemy team
   *
   * @param enemy - enemy to create team for
   */
  private async _createTeamFromEnemy(enemy: Enemy) {
    const blueprint = this._getBattleBlueprint(enemy);

    // Default team leader
    const team = [enemy];

    let teamSize =
      blueprint.limit[Math.floor(Math.random() * blueprint.limit.length)];

    while (--teamSize > 0) {
      team.push(await team[0].cloneAsync());
    }

    return new Team(team);
  }

  /**
   * Load a battle blueprint from an enemy
   *
   * @param enemy - enemy that references a blueprint
   *
   * @return the blueprint
   */
  private _getBattleBlueprint(enemy: Enemy): TeamBlueprint {
    const teamType = enemy.teamType;

    if (!teamType) {
      throw new MissingDataError(
        `Could not find team type for enemy "${enemy.ref_id}".`
      );
    }

    const blueprint = config.blueprints[teamType];

    if (!blueprint) {
      throw new MissingDataError(
        `Could not find team type "${teamType}" in battle.json.`
      );
    }

    return blueprint;
  }
}

export default BattleBuilder;
