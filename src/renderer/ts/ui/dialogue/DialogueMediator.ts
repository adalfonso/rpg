import Actor from "@/actor/Actor";
import Dialogue from "./Dialogue";
import InvalidDataError from "@/error/InvalidDataError";
import MissingDataError from "@/error/MissingDataError";
import Team from "@/combat/Team";
import TextStream from "./TextStream";
import Vector from "@common/Vector";
import { CallableMap, Eventful, Updatable } from "@/interfaces";
import { bus } from "@/EventBus";
import { isStringArray } from "@/types";

/** Used to start and stop dialogue with a team */
export class DialogueMediator implements Eventful, Updatable {
  /** Dialogue instance */
  private _dialogue: Dialogue;

  constructor(private _target: Team<Actor>) {
    bus.register(this);
  }

  /** Register this with the event bus */
  register(): CallableMap {
    return {
      "dialogue.create": this._createDialogue.bind(this),
    };
  }

  /**
   * Update the current dialogu
   *
   * @param dt - delta time
   **/
  public update(dt: number) {
    if (!this._dialogue) {
      return;
    }

    if (this._dialogue.isDone) {
      this._dialogue = null;
      this._target.each((member) => member.unlock());
      return;
    }

    this._dialogue.update(dt);
  }

  /**
   * Draw the dialogue
   *
   * @param ctx - render context
   * @param offset  - render offset
   * @param resolution - screen resolution
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    offset: Vector = new Vector(0, 0),
    resolution: Vector
  ) {
    this._dialogue?.draw(ctx, offset, resolution);
  }

  /**
   * Create a dialogue from a custom event
   *
   * @param e - custom event
   */
  private _createDialogue(e: CustomEvent) {
    if (this._dialogue) {
      throw new Error("Unable to create multiple dialogues at the same time");
    }

    const { speech, speaker } = e.detail;

    if (!speech) {
      throw new MissingDataError(
        "Unable to find speech or speaker when creating dialogue from DialogueMediator"
      );
    }

    if (!isStringArray(speech)) {
      throw new InvalidDataError(
        'Invalid data type for "speech" @ DialogueMediator/dialogue.create'
      );
    }

    if (speaker && speaker.constructor.name !== "Actor") {
      throw new InvalidDataError(
        'Invalid data type for "speaker" @ DialogueMediator/dialogue.create'
      );
    }

    const stream = new TextStream(speech);
    this._dialogue = new Dialogue(stream, speaker ?? null, this._target.all());
  }
}
