import Sut from "@/combat/OpponentSelect";
import Team from "@/combat/Team";
import { EventType } from "@/event/EventBus";
import { getEnemy } from "../actor/_fixtures";
import { state } from "@/state/StateManager";

afterEach(() => {
  state().empty();
});

describe("OpponentSelect", () => {
  describe("lock", () => {
    it("automatically locks the selection", () => {
      const sut = new Sut(new Team([getEnemy(), getEnemy(), getEnemy()]));

      expect(sut.isLocked).toBe(true);
    });

    it("manually locks the selection", () => {
      const sut = new Sut(new Team([getEnemy(), getEnemy(), getEnemy()]));

      sut.unlock();

      expect(sut.isLocked).toBe(false);

      sut.lock();

      expect(sut.isLocked).toBe(true);
    });

    it("manually unlocks the selection", () => {
      const sut = new Sut(new Team([getEnemy(), getEnemy(), getEnemy()]));

      expect(sut.isLocked).toBe(true);

      sut.unlock();

      expect(sut.isLocked).toBe(false);
    });
  });

  describe("selectedOpponent", () => {
    it("automatically selects the first opponent by default", () => {
      const enemies = [
        getEnemy({ name: "e1" }),
        getEnemy({ name: "e2" }),
        getEnemy({ name: "e3" }),
      ];

      const sut = new Sut(new Team(enemies));

      expect(sut.selected.id).toBe("e1");
    });

    it("selects the previous opponent", () => {
      const enemies = [
        getEnemy({ name: "e1" }),
        getEnemy({ name: "e2" }),
        getEnemy({ name: "e3" }),
      ];

      const sut = new Sut(new Team(enemies));

      const listeners = sut.register();

      sut.unlock();

      listeners[EventType.Keyboard].keyup({
        key: "ArrowLeft",
      } as KeyboardEvent);

      expect(sut.selected.id).toBe("e3");

      listeners[EventType.Keyboard].keyup({
        key: "ArrowLeft",
      } as KeyboardEvent);

      expect(sut.selected.id).toBe("e2");
    });

    it("selects the previous opponent but not ones that are defeated", () => {
      let defeatedEnemy = getEnemy({ name: "defeated" });

      const enemies = [
        getEnemy({ name: "e1" }),
        getEnemy({ name: "e2" }),
        defeatedEnemy,
      ];

      defeatedEnemy.kill();

      const sut = new Sut(new Team(enemies));

      const listeners = sut.register();

      sut.unlock();

      listeners[EventType.Keyboard].keyup({
        key: "ArrowLeft",
      } as KeyboardEvent);

      expect(sut.selected.id).toBe("e2");
    });

    it("selects the next opponent", () => {
      const enemies = [
        getEnemy({ name: "e1" }),
        getEnemy({ name: "e2" }),
        getEnemy({ name: "e3" }),
      ];

      const sut = new Sut(new Team(enemies));

      const listeners = sut.register();

      sut.unlock();

      listeners[EventType.Keyboard].keyup({
        key: "ArrowRight",
      } as KeyboardEvent);

      expect(sut.selected.id).toBe("e2");
      listeners[EventType.Keyboard].keyup({
        key: "ArrowRight",
      } as KeyboardEvent);

      expect(sut.selected.id).toBe("e3");
    });

    it("selects the next opponent but not ones that are defeated", () => {
      let defeatedEnemy = getEnemy({ name: "defeated" });

      const enemies = [
        getEnemy({ name: "e1" }),
        defeatedEnemy,
        getEnemy({ name: "e3" }),
      ];

      defeatedEnemy.kill();

      const sut = new Sut(new Team(enemies));

      const listeners = sut.register();

      sut.unlock();

      listeners[EventType.Keyboard].keyup({
        key: "ArrowRight",
      } as KeyboardEvent);

      expect(sut.selected.id).toBe("e3");
    });
  });

  describe("resolveSelected", () => {
    it("automatically resolves selection to the first non-defeated opponent", () => {
      const enemy1 = getEnemy({ name: "e1" });
      const enemy2 = getEnemy({ name: "e2" });
      const enemy3 = getEnemy({ name: "e3" });
      const enemy4 = getEnemy({ name: "e4" });

      const enemies = [enemy1, enemy2, enemy3, enemy4];

      enemy1.kill();
      enemy2.kill();

      const sut = new Sut(new Team(enemies));

      expect(sut.selected.id).toBe("e1");

      sut.resolveSelected();

      expect(sut.selected.id).toBe("e3");
    });
  });
});
