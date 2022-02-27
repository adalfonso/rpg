import Actor from "./Actor";
import Dialogue from "@/ui/dialogue/Dialogue";
import MissingDataError from "@/error/MissingDataError";
import TextStream from "@/ui/dialogue/TextStream";
import Vector from "@common/Vector";
import { Drawable, Eventful, CallableMap } from "@/interfaces";
import { Milestone } from "@/state/milestone/Milestone";
import { MilestoneAttainOn } from "@/state/milestone/types";
import { Speech } from "./types";
import { bus } from "@/EventBus";
import { getSpeech } from "./speech";
import {
  LevelFixtureTemplate,
  levelPropertyLookup,
} from "@/level/LevelFixture";

/** A non-playable character */
class NonPlayer extends Actor implements Eventful, Drawable {
  /** Entities that were recently collided with */
  private collisions: Actor[] = [];

  /** Speech/dialogue spoken by the npc */
  private _speech: Speech;

  /** Milestones tied to the npc */
  private _milestone: Milestone;

  /** If the npc is expired and should be torn down */
  private _is_expired = false;

  /**
   * Create a new NonPlayer instance
   *
   * TODO: handle sprites when they are available
   *
   * @param _position - the non-player's position
   * @param _size - the non-player's size
   * @param template - info about the non-player
   */
  constructor(
    _position: Vector,
    _size: Vector,
    template: LevelFixtureTemplate
  ) {
    super(_position, _size, template);
    const { type, name, properties } = template;
    const speech_key = `${type}.${name}`;

    this._speech = getSpeech(speech_key);

    if (this._speech === undefined) {
      throw new MissingDataError(
        `Speech data for "${speech_key}" as NonPlayer is not defined in speech.ts`
      );
    }

    const milestone_ref = levelPropertyLookup(properties)("milestone");

    if (milestone_ref !== undefined) {
      this._createMilestoneFromRef(milestone_ref);
    }

    this.resolveState(`nonPlayers.${this.id}`);

    bus.register(this);
  }

  /** If the NPC is expired and should be torn down */
  get isExpired() {
    return this._is_expired;
  }

  /** Manually tear down the npc */
  public expire() {
    bus.unregister(this);
    this.dialogue = null;
    this._is_expired = true;
  }

  /**
   * Update the non-player
   *
   * @param dt - delta time
   */
  public update(dt: number) {
    if (this.dialogue?.isDone) {
      this._milestone?.attain_on === MilestoneAttainOn.DialogueComplete &&
        this._milestone.attain({ actor: this });

      this.expire();
    } else if (this.dialogue) {
      this.dialogue.update(dt);
    }
  }

  /**
   * Draw NPC and all underlying entities
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
    if (this.dialogue) {
      const noOffset = new Vector(0, 0);
      this.dialogue.draw(ctx, noOffset, resolution);
    }

    super.draw(ctx, offset, resolution);
  }

  /**
   * Register events with the event bus
   *
   * @return events to register
   */
  public register(): CallableMap {
    return {
      keyup: (e: KeyboardEvent) => {
        if (e.key === "Enter" && this.collisions.length) {
          this.speak([...this.collisions]);
        }
      },

      "player.move": (e: CustomEvent) => {
        const player = e.detail?.player;

        if (!player) {
          throw new MissingDataError(
            "Player missing on player.move event as tracked by non-player."
          );
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
   * @param actors - actors recently collided with
   */
  private speak(actors: Actor[]) {
    if (this.dialogue) {
      return;
    }

    const stream = new TextStream([...this._speech.dialogue]);

    this.dialogue = new Dialogue(stream, this, actors);
  }

  /**
   * Create milestone for the NPC
   *
   * @param ref - ref name of milestone
   */
  private _createMilestoneFromRef(ref: string) {
    this._milestone = new Milestone(ref);

    // Assuming if there is a milestone related to the NPC they're not needed
    if (this._milestone.attained) {
      this.expire();
    }
  }
}

export default NonPlayer;
