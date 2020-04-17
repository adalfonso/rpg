import Actor from "./Actor";
import Dialogue from "@/Dialogue";
import Vector from "@/Vector";
import npcs from "./npcs.json";
import { Drawable, Eventful } from "@/interfaces";
import { bus } from "@/app";

/**
 * * NonPlayer is a non-playable character.
 */
class NonPlayer extends Actor implements Eventful, Drawable {
  /**
   * Info about the non-player
   * TODO: Make the type of data more specific
   *
   * @prop {object} data
   */
  private data: any;

  /**
   * Dialogue that the non-player is the leader of
   *
   * @prop {Dialogue} dialogue
   */
  private dialogue: Dialogue;

  /**
   * Entities that were recently collided with
   *
   * @prop {Actor[]} collisions
   */
  private collisions: Actor[] = [];

  /**
   * Create a new non player instance
   *
   * @param {object} data Info about the non-player
   */
  constructor(data) {
    super(new Vector(data.x, data.y), new Vector(data.width, data.height));

    let npc = npcs[data.name];

    if (!npc) {
      throw new Error("NPC data for " + name + " is not defined in npcs.json");
    }

    this.data = npc;
    this.dialogue = null;

    bus.register(this);
  }

  /**
   * Get the name used when rendering dialogue
   *
   * @prop {string} dialogueName
   */
  get dialogueName(): string {
    return this.data.display_name;
  }

  /**
   * Update the non-player
   *
   * @param {number} dt Delta time
   */
  public update(dt: number) {
    if (this.dialogue?.done) {
      this.dialogue = null;
    } else if (this.dialogue) {
      this.dialogue.update(dt);
    }
  }

  /**
   * Draw NPC and all underlying entities
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   offset     Render position offset
   * @param {Vector}                   resolution Render resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector,
    resolution: Vector
  ) {
    if (this.dialogue) {
      this.dialogue.draw(ctx, offset, resolution);
    }
  }

  /**
   * Register events with the event bus
   *
   * @return {object} Events to register
   */
  public register(): object {
    return {
      keyup: (e) => {
        if (e.key === "Enter" && this.collisions.length) {
          this.speak([...this.collisions]);
        }
      },

      "player.move": (e) => {
        const player = e.detail?.player;

        if (!player) {
          throw "Player missing on player.move event as tracked by non-player.";
        }

        if (this.collidesWith(player)) {
          if (!this.collisions.includes(player)) {
            this.collisions.push(player);
          }
        } else if (this.collisions.includes(player)) {
          this.collisions = this.collisions.filter((actor) => actor !== player);
        }
      },
    };
  }

  /**
   * Start a dialogue with all actors the non-player has collided with
   *
   * @param {Actor[]} actors Actors recently collided with
   */
  private speak(actors: Actor[]) {
    if (this.dialogue) {
      return;
    }

    this.dialogue = new Dialogue(this.data.default.speech, this, actors);
  }
}

export default NonPlayer;
