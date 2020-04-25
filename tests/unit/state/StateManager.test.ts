import { expect } from "chai";
import Sut from "@/state/StateManager";

describe("StateManager", () => {
  describe("getInstance", () => {
    it("shares the same instance", () => {
      expect(Sut.getInstance()).to.equal(Sut.getInstance());
      expect(Sut.getInstance()).to.not.equal(new Sut());
    });
  });

  describe("merge", () => {
    it("loads a level template for the first time", () => {
      let sut = new Sut();
      let expected = {
        actors: {
          knight0: {
            stats: {
              hp: 5,
            },
          },
        },
      };

      sut.merge(getBasicActorData());
      expect(sut.toJson()).to.equal(JSON.stringify(expected));
    });

    it("adds a property to a preexisting state", () => {
      let sut = new Sut();

      let expected = {
        actors: {
          knight0: {
            stats: {
              hp: 5,
            },
            defeated: true,
          },
        },
      };

      sut.merge(getBasicActorData());

      sut.merge({
        actors: {
          knight0: {
            defeated: true,
          },
        },
      });

      expect(sut.toJson()).to.equal(JSON.stringify(expected));
    });
  });

  describe("remove", () => {
    it("removes a property from a preexisting state", () => {
      let sut = new Sut();
      let input = getBasicActorData();
      let expected = {
        actors: {
          knight0: {
            stats: {
              hp: 5,
            },
          },
        },
      };

      input.actors.knight0.weapon = "Big Sword";
      sut.merge(input);

      sut.remove("actors.knight0.weapon");

      expect(sut.toJson()).to.equal(JSON.stringify(expected));
    });

    it("doesn't error when trying to remove a non-existent key", () => {
      let sut = new Sut();
      let input = {
        hello: 1,
      };

      sut.merge(input);

      sut.remove("actors.knight0.weapon");

      expect(sut.toJson()).to.equal(JSON.stringify(input));
    });
  });
});

const getBasicActorData = (): any => {
  return {
    actors: {
      knight0: {
        stats: {
          hp: 5,
        },
      },
    },
  };
};
