import Enemy from "@/actors/Enemy";
import StateManager from "@/state/StateManager";
import Sut from "@/combat/OpponentSelect";
import Team from "@/combat/Team";
import { expect } from "chai";

const state = StateManager.getInstance();

afterEach(() => {
  state.empty();
});

describe("OpponentSelect", () => {
  describe("lock", () => {
    it("automatically locks the selection", () => {
      const sut = new Sut(new Team([getEnemy(), getEnemy(), getEnemy()]));

      expect(sut.isLocked).to.be.true;
    });

    it("manually locks the selection", () => {
      const sut = new Sut(new Team([getEnemy(), getEnemy(), getEnemy()]));

      sut.unlock();

      expect(sut.isLocked).to.be.false;

      sut.lock();

      expect(sut.isLocked).to.be.true;
    });

    it("manually unlocks the selection", () => {
      const sut = new Sut(new Team([getEnemy(), getEnemy(), getEnemy()]));

      expect(sut.isLocked).to.be.true;

      sut.unlock();

      expect(sut.isLocked).to.be.false;
    });
  });

  describe("selectedOpponent", () => {
    it("automatically selects the first opponent by default", () => {
      const enemies = [getEnemy(), getEnemy(), getEnemy()];

      const sut = new Sut(new Team(enemies));

      expect(sut.selected).to.equal(enemies[0]);
    });

    it("selects the previous opponent", () => {
      const enemies = [getEnemy(), getEnemy(), getEnemy()];

      const sut = new Sut(new Team(enemies));

      const listeners = sut.register();

      sut.unlock();

      listeners.keyup({ key: "ArrowLeft" });

      expect(sut.selected).to.equal(enemies[2]);

      listeners.keyup({ key: "ArrowLeft" });

      expect(sut.selected).to.equal(enemies[1]);
    });

    it("selects the previous opponent but not ones that are defeated", () => {
      let defeatedEnemy = getEnemy();

      const enemies = [getEnemy(), getEnemy(), defeatedEnemy];

      defeatedEnemy.kill();

      const sut = new Sut(new Team(enemies));

      const listeners = sut.register();

      sut.unlock();

      listeners.keyup({ key: "ArrowLeft" });

      expect(sut.selected).to.equal(enemies[1]);
    });

    it("selects the next opponent", () => {
      const enemies = [getEnemy(), getEnemy(), getEnemy()];

      const sut = new Sut(new Team(enemies));

      const listeners = sut.register();

      sut.unlock();

      listeners.keyup({ key: "ArrowRight" });

      expect(sut.selected).to.equal(enemies[1]);
      listeners.keyup({ key: "ArrowRight" });

      expect(sut.selected).to.equal(enemies[2]);
    });

    it("selects the next opponent but not ones that are defeated", () => {
      let defeatedEnemy = getEnemy();

      const enemies = [getEnemy(), defeatedEnemy, getEnemy()];

      defeatedEnemy.kill();

      const sut = new Sut(new Team(enemies));

      const listeners = sut.register();

      sut.unlock();

      listeners.keyup({ key: "ArrowRight" });

      expect(sut.selected).to.equal(enemies[2]);
    });
  });

  describe("resolveSelected", () => {
    it("automatically resolves selection to the first non-defeated opponent", () => {
      const enemy1 = getEnemy();
      const enemy2 = getEnemy();
      const enemy3 = getEnemy();
      const enemy4 = getEnemy();

      const enemies = [enemy1, enemy2, enemy3, enemy4];

      enemy1.kill();
      enemy2.kill();

      const sut = new Sut(new Team(enemies));

      expect(sut.selected).to.equal(enemies[0]);

      sut.resolveSelected();

      expect(sut.selected).to.equal(enemies[2]);
    });
  });
});

const getEnemy = () => {
  return new Enemy({ name: "test", type: "knight" });
};
