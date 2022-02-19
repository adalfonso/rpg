import Damage from "@/combat/Damage";
import Renderable from "@/ui/Renderable";
import StatModifier from "@/combat/strategy/StatModifier";
import Sut from "@/Stats";
import sinon from "sinon";
import { expect } from "chai";

describe("Stats", () => {
  describe("getters", () => {
    it("accesses stats (hp, atk, def, sp_atk, sp_def, spd, lvl, dmg, exp)", () => {
      let sut = getSut();

      expect(sut.hp).to.equal(25);
      expect(sut.atk).to.equal(37);
      expect(sut.def).to.equal(20);
      expect(sut.sp_atk).to.equal(30);
      expect(sut.sp_def).to.equal(10);
      expect(sut.spd).to.equal(17);
      expect(sut.lvl).to.equal(10);
      expect(sut.dmg).to.equal(0);
      expect(sut.exp).to.equal(0);
    });
  });

  describe("setters", () => {
    it("manually sets dmg", () => {
      let sut = getSut();
      sut.dmg = 5;
      expect(sut.dmg).to.equal(5);
    });

    it("manually sets lvl", () => {
      let sut = getSut();
      sut.lvl = 4;
      expect(sut.lvl).to.equal(4);
    });

    it("manually sets exp", () => {
      let sut = getSut();
      sut.exp = 66;
      expect(sut.exp).to.equal(66);
      sut.exp = 0;
      expect(sut.exp).to.equal(0);
    });

    it("doesn't manually sets invalid dmg amount", () => {
      let sut = getSut();

      expect(function () {
        sut.dmg = -1;
      }).to.throw("Invalid input when setting dmg stat: -1");

      expect(function () {
        sut.dmg = 5.5;
      }).to.throw("Invalid input when setting dmg stat: 5.5");
    });

    it("doesn't manually sets invalid lvl amount", () => {
      let sut = getSut();

      expect(function () {
        sut.lvl = 0;
      }).to.throw("Invalid input when setting lvl stat: 0");

      expect(function () {
        sut.lvl = 5.5;
      }).to.throw("Invalid input when setting lvl stat: 5.5");

      expect(function () {
        sut.lvl = 101;
      }).to.throw("Invalid input when setting lvl stat: 101");
    });

    it("doesn't manually sets invalid exp amount", () => {
      let sut = getSut();

      expect(function () {
        sut.exp = -1;
      }).to.throw("Invalid input when setting exp stat: -1");

      expect(function () {
        sut.exp = 5.5;
      }).to.throw("Invalid input when setting exp stat: 5.5");

      expect(function () {
        sut.exp = Infinity;
      }).to.throw("Invalid input when setting exp stat: Infinity");
    });
  });

  describe("givesExp", () => {
    it("gets the experience yield from stat holder", () => {
      expect(getSut().givesExp).to.equal(140);
    });
  });

  describe("gainExp", () => {
    it("increases the experience stat", () => {
      let sut = getSut();
      sut.gainExp(100);
      expect(sut.exp).to.equal(100);
    });
  });

  describe("nextLevel", () => {
    it("increases the level by 1", () => {
      let sut = getSut();
      sut.gainExp(1000);
      expect(sut.lvl).to.equal(11);
    });

    it("doesn't increase level from level 100", () => {
      let sut = getSut();
      sut.lvl = 100;
      sut.gainExp(1e9);
      expect(sut.lvl).to.equal(100);
    });
  });

  describe("endure", () => {
    it("reflects damage dealt in the hp stat", () => {
      let sut = getSut();
      expect(sut.hp).to.equal(25);
      sut.endure(getDamage(1));
      expect(sut.hp).to.equal(24);

      sut.endure(getDamage(24));
      expect(sut.hp).to.equal(20);
    });
  });

  describe("modify", () => {
    it("applies a stat modifier", () => {
      const sut = getSut();

      expect(sut.def).to.equal(20);

      const mod = getModifier();
      sinon.stub(mod, "stat").get(() => "def");
      sinon.stub(mod, "value").get(() => 0.25);
      sut.modify(mod);

      expect(sut.def).to.equal(25);
    });

    it("applies hp stat modifier properly with damage", () => {
      const sut = getSut();

      expect(sut.hp).to.equal(25);

      const hpMod = getModifier();
      sinon.stub(hpMod, "stat").get(() => "hp");
      sinon.stub(hpMod, "value").get(() => 0.5);
      sut.modify(hpMod);

      expect(sut.hp).to.equal(37.5);

      sut.endure(new Damage(30, "physical"));

      expect(sut.hp).to.equal(27.5);
    });

    it("applies multiple stat modifiers", () => {
      const sut = getSut();

      expect(sut.atk).to.equal(37);

      const mod = getModifier();
      sinon.stub(mod, "stat").get(() => "atk");
      sinon.stub(mod, "value").get(() => 0.25);
      sut.modify(mod);

      const mod2 = getModifier();
      sinon.stub(mod2, "stat").get(() => "atk");
      sinon.stub(mod2, "value").get(() => 0.5);
      sut.modify(mod2);

      expect(sut.atk).to.equal(64.75);
    });
  });

  describe("expireModifiers", () => {
    it("expires modifiers that have been used", () => {
      const sut = getSut();

      expect(sut.sp_def).to.equal(10);
      expect(sut.sp_atk).to.equal(30);
      expect(sut.hp).to.equal(25);

      const spDefMod = getModifier({ duration: 1 });
      sinon.stub(spDefMod, "stat").get(() => "sp_def");
      sinon.stub(spDefMod, "value").get(() => 0.1);
      sut.modify(spDefMod);

      const spAtkMod = getModifier({ duration: 2 });
      sinon.stub(spAtkMod, "stat").get(() => "sp_atk");
      sinon.stub(spAtkMod, "value").get(() => 0.5);
      sut.modify(spAtkMod);

      const hpMod = getModifier({ duration: Infinity });
      sinon.stub(hpMod, "stat").get(() => "hp");
      sinon.stub(hpMod, "value").get(() => 0.5);
      sut.modify(hpMod);

      expect(sut.sp_def).to.equal(11);
      expect(sut.sp_atk).to.equal(45);
      expect(sut.hp).to.equal(37.5);

      sut.expireModifiers();

      expect(sut.sp_def).to.equal(10);
      expect(sut.sp_atk).to.equal(45);
      expect(sut.hp).to.equal(37.5);

      sut.expireModifiers();

      expect(sut.sp_def).to.equal(10);
      expect(sut.sp_atk).to.equal(30);
      expect(sut.hp).to.equal(37.5);

      sut.expireModifiers();
      sut.expireModifiers();
      sut.expireModifiers();
      expect(sut.hp).to.equal(37.5);
    });
  });
});

const getDamage = (amount: number) => {
  return new Damage(amount, "physical");
};

const getSut = () => {
  let sut = new Sut(getStats());
  sut.lvl = 10;

  return sut;
};

const getStats = () => {
  return {
    hp: 100,
    atk: 150,
    def: 80,
    sp_atk: 120,
    sp_def: 40,
    spd: 70,
  };
};

const getModifier = (config: any = {}) => {
  const renderable = new Renderable("missing");

  return new StatModifier(
    {
      displayAs: "",
      description: "",
      stat: config.stat ?? "def",
      self: true,
      value: 0,
      duration: config.duration ?? 1,
      ui: {
        sprite: "default missing",
      },
    },
    renderable
  );
};
