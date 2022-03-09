import Actor from "@/actor/Actor";
import Dialogue from "./Dialogue";
import InvalidDataError from "@/error/InvalidDataError";
import MissingDataError from "@/error/MissingDataError";
import Team from "@/combat/Team";
import TextStream from "./TextStream";
import Vector from "@common/Vector";
import { Updatable } from "@/interfaces";
import { bus, EventType } from "@/EventBus";
import { isStringArray, Nullable } from "@/types";

/** Used to start and stop dialogue with a team */
export class DialogueMediator implements Updatable {
  /** Dialogue instance */
  private _dialogue: Nullable<Dialogue> = null;

  constructor(private _target: Team<Actor>) {
    bus.register(this);
  }

  /** Register this with the event bus */
  public register() {
    return {
      [EventType.Custom]: {
        "dialogue.create": this._createDialogue.bind(this),
      },
    };
  }

  /**
   * Update the current dialogue
   *
   * @param dt - delta time
   */
  public update(dt: number) {
    if (!this._dialogue) {
      return;
    }

    if (this._dialogue.isDone) {
      const speaker = this._dialogue.speaker;
      this._dialogue = null;
      this._target.each((member) => member.unlock());
      return bus.emit("dialogue.end", { speaker });
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
    offset: Vector = Vector.empty(),
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

    if (speaker && !(speaker instanceof Actor)) {
      throw new InvalidDataError(
        'Invalid data type for "speaker" @ DialogueMediator/dialogue.create'
      );
    }

    const stream = new TextStream(speech);
    this._dialogue = new Dialogue(stream, speaker ?? null, this._target.all());
    bus.emit("dialogue.start");
  }
}
