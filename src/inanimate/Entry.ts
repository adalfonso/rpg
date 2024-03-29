import * as ex from "excalibur";
import MissingDataError from "@/error/MissingDataError";
import { CollisionType } from "excalibur";
import { TiledTemplate } from "@/actor/types";

/** An area on the map that an entity can be loaded on */
export class Entry extends ex.Actor {
  /**
   * Create a new Entry instance
   *
   * @param _template - info about the entry
   */
  constructor(private _template: TiledTemplate) {
    if (_template.name === undefined) {
      throw new MissingDataError('Missing required "name" when creating Entry');
    }

    super({ ..._template, collisionType: CollisionType.PreventCollision });
  }

  get ref() {
    return this._template.name;
  }
}
