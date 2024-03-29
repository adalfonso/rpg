import Team from "@/combat/Team";
import { Dialogue } from "@/ui/dialogue/Dialogue";
import { DialogueMediator } from "@/ui/dialogue/DialogueMediator";
import { EventType } from "@/event/EventBus";
import { getPlayer } from "../../actor/_fixtures";

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
      const player = getPlayer();

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
