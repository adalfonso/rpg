import Enemy from "@/actors/Enemy";
import Sut from "@/combat/OpponentSelect";
import Team from "@/combat/Team";
import { expect } from "chai";

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

    it("selects the correct opponent when hitting the left arrow key", () => {
      const enemies = [getEnemy(), getEnemy(), getEnemy()];

      const sut = new Sut(new Team(enemies));

      const listeners = sut.register();

      sut.unlock();

      listeners.keyup({ key: "ArrowLeft" });

      expect(sut.selected).to.equal(enemies[2]);
    });

    it("selects the correct opponent when hitting the right arrow key", () => {
      const enemies = [getEnemy(), getEnemy(), getEnemy()];

      const sut = new Sut(new Team(enemies));

      const listeners = sut.register();

      sut.unlock();

      listeners.keyup({ key: "ArrowRight" });

      expect(sut.selected).to.equal(enemies[1]);
    });
  });
});

const getEnemy = () => {
  return new Enemy({ name: "test", type: "knight" });
};
