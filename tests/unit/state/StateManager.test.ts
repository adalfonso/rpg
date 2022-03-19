import { StateManager as Sut } from "@/state/StateManager";
import { fs } from "@tauri-apps/api";

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
      const sut = new Sut();
      const expected = { stats: { hp: 5 } };

      sut.merge(getBasicActorData());

      expect(sut.get("actors.knight0")).toEqual(expected);
    });

    it("doesn't find data in the state by invalid reference", () => {
      const sut = new Sut();

      expect(sut.get("actors.knight0")).toBeUndefined();
    });

    it("gets the entire state when the reference key is undefined", () => {
      const sut = new Sut();
      const expected = getBasicActorData();

      sut.merge(getBasicActorData());

      expect(sut.get()).toEqual(expected);
      expect(sut.get()).not.toBe(expected);
    });
  });

  describe("merge", () => {
    it("loads a level template for the first time", () => {
      const sut = new Sut();
      const expected = { actors: { knight0: { stats: { hp: 5 } } } };

      sut.merge(getBasicActorData());
      expect(sut.toJson()).toBe(JSON.stringify(expected));
    });

    it("adds a property to a preexisting state", () => {
      const sut = new Sut();
      const expected = {
        actors: { knight0: { stats: { hp: 5 }, defeated: true } },
      };

      sut.merge(getBasicActorData());
      sut.merge({ actors: { knight0: { defeated: true } } });
      expect(sut.toJson()).toBe(JSON.stringify(expected));
    });
  });

  describe("mergeByRef", () => {
    it("loads by ref for a pre-existing ref", () => {
      const sut = new Sut();

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
      const sut = new Sut();
      const expected = { actors: { knight0: { stats: { hp: 5 } } } };

      sut.empty();
      expect(sut.get("actors.knight0")).toBeUndefined();
      expect(sut.get("actors.knight0.stats.hp")).toBeUndefined();

      const result = sut.mergeByRef("actors.knight0.stats.hp", 5);
      expect(result).toEqual(5);
      expect(sut.toJson()).toBe(JSON.stringify(expected));
    });
  });

  describe("remove", () => {
    it("removes a property from a preexisting state", () => {
      const sut = new Sut();
      const input = getBasicActorData();
      const expected = { actors: { knight0: { stats: { hp: 5 } } } };

      input.actors.knight0.weapon = "Big Sword";
      sut.merge(input);
      sut.remove("actors.knight0.weapon");
      expect(sut.toJson()).toBe(JSON.stringify(expected));
    });

    it("doesn't error when trying to remove a non-existent key", () => {
      const sut = new Sut();
      const input = { hello: 1 };

      sut.merge(input);
      sut.remove("actors.knight0.weapon");
      expect(sut.toJson()).toBe(JSON.stringify(input));
    });
  });

  describe("empty", () => {
    it("completely empties the state", () => {
      const sut = new Sut();

      sut.merge(getBasicActorData());
      expect(sut.get()).not.toEqual({});

      sut.empty();
      expect(sut.get()).toEqual({});
    });
  });

  describe("save", () => {
    it("saves a file to disk", async () => {
      const sut = new Sut();
      const state = { player: { stats: { lvl: 100 } } };
      const file = getTempPath("save_state.json");

      jest
        .spyOn(fs, "readTextFile")
        .mockResolvedValueOnce(
          JSON.stringify({ player: { stats: { lvl: 100 } } })
        );

      sut.merge(state);

      await sut.save(file);

      const contents = await fs.readTextFile("");

      expect(contents).toBe(JSON.stringify(state));
    });
  });

  describe("load", () => {
    it("loads a file from disk", async () => {
      const expected = { player: { stats: { lvl: 100 } } };
      const sut = new Sut();
      const file = getAssetPath("save_state.json");

      jest
        .spyOn(fs, "readTextFile")
        .mockResolvedValueOnce(
          JSON.stringify({ player: { stats: { lvl: 100 } } })
        );

      await sut.load(file);

      expect(sut.toJson()).toBe(JSON.stringify(expected));
    });
  });
});

const getBasicActorData = (): any => {
  return { actors: { knight0: { stats: { hp: 5 } } } };
};
