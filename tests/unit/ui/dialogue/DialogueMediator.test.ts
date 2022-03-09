import Dialogue from "@/ui/dialogue/Dialogue";
import Player from "@/actor/Player";
import Team from "@/combat/Team";
import Vector from "@common/Vector";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { EventType } from "@/EventBus";
import {
  getAbilityTemplate,
  getActorTemplate,
} from "../../../unit/level/fixtures";

jest.mock("@/actor/actors", () => ({
  __esModule: true,
  actors: () => ({ _foo_dialogue_mediator: getActorTemplate() }),
}));

jest.mock("@/combat/strategy/abilities", () => ({
  abilities: () => ({ damage: { _default_ability: getAbilityTemplate() } }),
}));

describe("DialogueMediator", () => {
  describe("_createDialogue", () => {
    it("detects missing speech", () => {
      const mediator = new DialogueMediator([] as any);

      const events = mediator.register();

      expect(() =>
        events[EventType.Custom]["dialogue.create"]({
          detail: {},
        } as CustomEvent)
      ).toThrowError(
        "Unable to find speech or speaker when creating dialogue from DialogueMediator"
      );
    });

    it("detects invalid speech", () => {
      const mediator = new DialogueMediator([] as any);

      const events = mediator.register();

      expect(() =>
        events[EventType.Custom]["dialogue.create"]({
          detail: { speech: "foo" },
        } as CustomEvent)
      ).toThrowError(
        'Invalid data type for "speech" @ DialogueMediator/dialogue.create'
      );
    });

    it("detects invalid speaker", () => {
      const mediator = new DialogueMediator([] as any);

      const events = mediator.register();

      expect(() =>
        events[EventType.Custom]["dialogue.create"]({
          detail: { speech: ["foo"], speaker: {} },
        } as CustomEvent)
      ).toThrowError(
        'Invalid data type for "speaker" @ DialogueMediator/dialogue.create'
      );
    });

    it("locks targets while dialogue is active", () => {
      const player = new Player(Vector.empty(), Vector.empty(), {
        type: "_foo_dialogue_mediator",
      } as any);

      const lock_spy = jest.spyOn(player, "lock");
      const unlock_spy = jest.spyOn(player, "unlock");

      jest.spyOn(Dialogue.prototype, "isDone", "get").mockReturnValue(true);

      const team = new Team([player]);
      const mediator = new DialogueMediator(team);
      const events = mediator.register();

      events[EventType.Custom]["dialogue.create"]({
        detail: { speech: ["foo"] },
      } as CustomEvent);

      expect(lock_spy).toHaveBeenCalled();
      expect(unlock_spy).toHaveBeenCalledTimes(0);

      mediator.update(1000);
      mediator.update(1);

      expect(unlock_spy).toHaveBeenCalledTimes(1);
    });
  });
});
