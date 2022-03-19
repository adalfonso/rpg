import Sut from "@/state/StateManager";
import { promises as fs } from "fs";

const getTempPath = (file: string) => "./tests/temp/" + file;
const getAssetPath = (file: string) => "./tests/assets/" + file;

describe("StateManager", () => {
  describe("getInstance", () => {
    it("shares the same instance", () => {
      expect(Sut.getInstance()).toBe(Sut.getInstance());
      expect(Sut.getInstance()).not.toBe(new Sut());
    });
  });

  describe("get", () => {
    it("find data in the state by reference", () => {
      let sut = new Sut();
      let expected = {
        stats: {
          hp: 5,
        },
      };

      sut.merge(getBasicActorData());

      expect(sut.get("actors.knight0")).toEqual(expected);
    });

    it("doesn't find data in the state by invalid reference", () => {
      let sut = new Sut();

      expect(sut.get("actors.knight0")).toBeUndefined();
    });

    it("gets the entire state when the reference key is undefined", () => {
      let sut = new Sut();
      let expected = getBasicActorData();

      sut.merge(getBasicActorData());

      expect(sut.get()).toEqual(expected);
      expect(sut.get()).not.toBe(expected);
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
      expect(sut.toJson()).toBe(JSON.stringify(expected));
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

      expect(sut.toJson()).toBe(JSON.stringify(expected));
    });
  });

  describe("mergeByRef", () => {
    it("loads by ref for a pre-existing ref", () => {
      let sut = new Sut();

      sut.merge(getBasicActorData());

      expect(sut.get("actors.knight0.stats.hp")).toBe(5);

      sut.mergeByRef("actors.knight0.stats.hp", 10);

      expect(sut.get("actors.knight0.stats.hp")).toBe(10);

      const result = sut.mergeByRef(
        "actors.knight0.stats",
        JSON.stringify({ hp: 4, atk: 13 })
      );

      expect(result).toBe(JSON.stringify({ hp: 4, atk: 13 }));
    });

    it("loads by ref for a non-existing ref", () => {
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

      sut.empty;

      expect(sut.get("actors.knight0")).toBeUndefined();
      expect(sut.get("actors.knight0.stats.hp")).toBeUndefined();

      const result = sut.mergeByRef("actors.knight0.stats.hp", 5);

      expect(result).toEqual(5);
      expect(sut.toJson()).toBe(JSON.stringify(expected));
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

      expect(sut.toJson()).toBe(JSON.stringify(expected));
    });

    it("doesn't error when trying to remove a non-existent key", () => {
      let sut = new Sut();
      let input = {
        hello: 1,
      };

      sut.merge(input);

      sut.remove("actors.knight0.weapon");

      expect(sut.toJson()).toBe(JSON.stringify(input));
    });
  });

  describe("empty", () => {
    it("completely empties the state", () => {
      let sut = new Sut();

      sut.merge(getBasicActorData());

      expect(sut.get()).not.toEqual({});

      sut.empty();

      expect(sut.get()).toEqual({});
    });
  });

  describe("save", () => {
    it("saves a file to disk", async () => {
      let sut = new Sut();

      let state = {
        player: {
          stats: {
            lvl: 25,
          },
        },
      };

      let file = getTempPath("save_state.json");

      sut.merge(state);

      await sut.save(file);

      let contents = await fs.readFile(file, { encoding: "utf8" });

      expect(contents).toBe(JSON.stringify(state));
    });
  });

  describe("load", () => {
    it("loads a file from disk", async () => {
      let expected = {
        player: {
          stats: {
            lvl: 100,
          },
        },
      };

      let sut = new Sut();

      let file = getAssetPath("save_state.json");

      await sut.load(file);

      expect(sut.toJson()).toBe(JSON.stringify(expected));
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
