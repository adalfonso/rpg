import BaseActor from "./actors/BaseActor";
import BaseInanimate from "./inanimates/BaseInanimate";
import Dialogue from "./Dialogue";
import Enemy from "./actors/Enemy";
import Map from "./inanimates/Map";
import Player from "./actors/Player";
import config from "./config";
import tileset from "@img/dungeon_sheet.png";

class Level {
  protected inanimates: BaseInanimate[];
  protected actors: BaseActor[];
  protected dialogues: Dialogue[];
  public player: Player;
  public map: Map;

  constructor(json, player: Player) {
    this.player = player;
    this.inanimates = [];
    this.actors = [];
    this.dialogues = [];

    this.reload(json);

    // this.dialogues.push(
    //     new Dialogue([
    //         'Huh... Where am I?',
    //         'How did I get here?'
    //     ], this.player)
    // );
  }

  reload(json, portal?) {
    if (this.map) {
      this.map.destruct();
    }

    this.map = new Map(json, tileset, this.player);

    let start = portal
      ? this.map.playerStarts[portal.portal_from]
      : this.map.playerStarts["0.0"];

    this.player.pos.x = start.x * config.scale;
    this.player.pos.y = start.y * config.scale;
  }

  update(dt: number) {
    this.entities.forEach((entity) => {
      entity.update(dt);

      if (entity instanceof Enemy && entity.collidesWith(this.player)) {
        entity.fight(this.player);
      }
    });

    this.dialogues.forEach((dialogue, index) => {
      if (dialogue.done) {
        this.dialogues.splice(index, 1);
      }
    });

    return this.map.update(dt);
  }

  get entities(): any[] {
    return [
      this.player,
      ...this.inanimates,
      ...this.actors,
      ...this.dialogues,
      ...this.map.npcs,
      ...this.map.enemies,
    ];
  }
}

export default Level;
