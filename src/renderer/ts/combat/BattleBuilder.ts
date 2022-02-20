import Battle from "./Battle";
import Enemy from "@/actor/Enemy";
import MissingDataError from "@/error/MissingDataError";
import OpponentSelect from "./OpponentSelect";
import Team from "./Team";
import config from "./battle.json";
import { AnimatedTextFactory } from "@/ui/animation/text/AnimatedTextFactory";

/**
 * Blueprint for an enemy team
 */
type TeamBlueprint = {
  limit: number[];
  include: string[];
  require: string[];
};

class BattleBuilder {
  /**
   * Create a new Battle
   *
   * @param e - target event
   *
   * @return battle instance
   */
  public static create(e: CustomEvent): Battle {
    const builder = new BattleBuilder();
    return builder.createFromEvent(e);
  }

  /**
   * Create a battle from a battle event
   *
   * @param e - target event
   *
   * @return battle instance
   *
   * @throws {MissingDataError} when the player/enemy aren't provided
   */
  public createFromEvent(e: CustomEvent): Battle {
    const heroes = e.detail?.heroes;
    const enemy = e.detail?.enemy;

    if (!heroes) {
      throw new MissingDataError(
        `Missing hero team when creating a battle from an event.`
      );
    }

    if (!enemy) {
      throw new MissingDataError(
        `Missing enemy when creating a battle from an event.`
      );
    }

    const enemyTeam = this._createTeamFromEnemy(enemy);

    return new Battle(
      heroes,
      enemyTeam,
      new OpponentSelect(enemyTeam),
      AnimatedTextFactory.createStartBattleAnimation()
    );
  }

  /**
   * Create an enemy team
   *
   * @param enemy - enemy to create team for
   */
  private _createTeamFromEnemy(enemy: Enemy) {
    const blueprint = this._getBattleBlueprint(enemy);

    // Default team leader
    const team = [enemy];

    let teamSize =
      blueprint.limit[Math.floor(Math.random() * blueprint.limit.length)];

    while (--teamSize > 0) {
      team.push(team[0].clone());
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
        `Could not find team type for enemy "${enemy.id}".`
      );
    }

    const blueprint = config.blueprints[teamType];

    if (!blueprint) {
      throw new MissingDataError(
        `Could not find team type "${teamType}" in battle.json.`
      );
    }

    /**
     * NOTE: No type checking is going on here besides that the data are arrays.
     * This is a potential source of bugs if the data aren't configured properly.
     */
    ["limit", "include", "require"].forEach((prop) => {
      const value = blueprint[prop];

      if (value && Array.isArray(value)) {
        return;
      }

      throw new MissingDataError(
        `Missing required property "${prop}" when loading team blueprint "${teamType}".`
      );
    });

    return blueprint;
  }
}

export default BattleBuilder;
