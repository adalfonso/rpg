import Team from "@/combat/Team";
import { EventType } from "@/event/EventBus";
import { OpponentSelect } from "@/combat/OpponentSelect";
import { getEnemy } from "../actor/_fixtures";
import { state } from "@/state/StateManager";

afterEach(() => {
  state().empty();
});

describe("OpponentSelect", () => {
  describe("lock", () => {
    it("automatically locks the selection", () => {
      const select = new OpponentSelect(
        new Team([getEnemy(), getEnemy(), getEnemy()])
      );

      expect(select.graphics.visible).toBe(true);
    });

    it("manually shows and hides the selection", () => {
      const select = new OpponentSelect(
        new Team([getEnemy(), getEnemy(), getEnemy()])
      );

      select.hide();
      expect(select.graphics.visible).toBe(false);

      select.show();
      expect(select.graphics.visible).toBe(true);
    });
  });

  describe("selectedOpponent", () => {
    it("automatically selects the first opponent by default", () => {
      const enemies = [
        getEnemy({ name: "e1" }),
        getEnemy({ name: "e2" }),
        getEnemy({ name: "e3" }),
      ];

      const select = new OpponentSelect(new Team(enemies));

      expect(select.selected.ref).toBe("e1");
    });

    it("selects the previous opponent", () => {
      const enemies = [
        getEnemy({ name: "e1" }),
        getEnemy({ name: "e2" }),
        getEnemy({ name: "e3" }),
      ];

      const select = new OpponentSelect(new Team(enemies));
      const listeners = select.register();

      select.show();

      listeners[EventType.Keyboard].keyup({
        key: "ArrowLeft",
      } as KeyboardEvent);

      expect(select.selected.ref).toBe("e3");

      listeners[EventType.Keyboard].keyup({
        key: "ArrowLeft",
      } as KeyboardEvent);

      expect(select.selected.ref).toBe("e2");
    });

    it("selects the previous opponent but not ones that are defeated", () => {
      let defeatedEnemy = getEnemy({ name: "defeated" });

      const enemies = [
        getEnemy({ name: "e1" }),
        getEnemy({ name: "e2" }),
        defeatedEnemy,
      ];

      defeatedEnemy.kill();

      const select = new OpponentSelect(new Team(enemies));
      const listeners = select.register();

      select.show();

      listeners[EventType.Keyboard].keyup({
        key: "ArrowLeft",
      } as KeyboardEvent);

      expect(select.selected.ref).toBe("e2");
    });

    it("selects the next opponent", () => {
      const enemies = [
        getEnemy({ name: "e1" }),
        getEnemy({ name: "e2" }),
        getEnemy({ name: "e3" }),
      ];

      const select = new OpponentSelect(new Team(enemies));

      const listeners = select.register();

      select.show();

      listeners[EventType.Keyboard].keyup({
        key: "ArrowRight",
      } as KeyboardEvent);

      expect(select.selected.ref).toBe("e2");
      listeners[EventType.Keyboard].keyup({
        key: "ArrowRight",
      } as KeyboardEvent);

      expect(select.selected.ref).toBe("e3");
    });

    it("selects the next opponent but not ones that are defeated", () => {
      let defeatedEnemy = getEnemy({ name: "defeated" });

      const enemies = [
        getEnemy({ name: "e1" }),
        defeatedEnemy,
        getEnemy({ name: "e3" }),
      ];

      defeatedEnemy.kill();

      const select = new OpponentSelect(new Team(enemies));
      const listeners = select.register();

      select.show();

      listeners[EventType.Keyboard].keyup({
        key: "ArrowRight",
      } as KeyboardEvent);

      expect(select.selected.ref).toBe("e3");
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

      const select = new OpponentSelect(new Team(enemies));

      expect(select.selected.ref).toBe("e1");

      select.resolveSelected();

      expect(select.selected.ref).toBe("e3");
    });
  });
});
