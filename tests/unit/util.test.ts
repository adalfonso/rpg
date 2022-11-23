import { fs, path } from "@tauri-apps/api";
import { merge, resolveSaveData } from "@/util";

afterEach(() => {
  jest.clearAllMocks();
});

describe("util", () => {
  describe("merge", () => {
    it("merges two objects together", () => {
      let obj1 = { things: { thing1: 1, thing2: 2 } };
      let obj2 = { things: { thing2: "two", thing3: "three" } };

      let expected = {
        things: { thing1: 1, thing2: "two", thing3: "three" },
      };

      expect(merge(obj1, obj2)).toEqual(expected);
    });

    it("merges two complex objects together", () => {
      let obj1 = {
        foo: {
          bar: { baz: [1, 2, 3], buz: [1, 2, 3] },
          boo: { bat: { bim: 4 } },
          bif: { bod: { byte: "bip" } },
        },
      };

      let obj2 = {
        hey: 11,
        foo: { bar: { baz: [4, 5, 6] }, boo: { bat: { bim: 5 } } },
      };

      let expected = {
        hey: 11,
        foo: {
          bar: { baz: [4, 5, 6], buz: [1, 2, 3] },
          boo: { bat: { bim: 5 } },
          bif: { bod: { byte: "bip" } },
        },
      };

      expect(merge(obj1, obj2)).toEqual(expected);
    });

    it("doesn't retain references to the inputs by default", () => {
      let obj1: any = { foo: { far: 1 } };
      let obj2: any = { bar: { baz: [1, 2, 3] } };

      let expected = {
        foo: { far: 1 },
        bar: { baz: [1, 2, 3] },
      };

      let merged = merge(obj1, obj2);

      obj1.foo.far = 10;
      obj2.bar.baz.push(4);

      expect(merged).toEqual(expected);
    });

    it("retains references to the inputs when requested", () => {
      let obj1: any = { foo: { far: 1 } };

      let obj2: any = { bar: { baz: [1, 2, 3] } };

      let merged = merge(obj1, obj2, true);

      obj1.foo.far = 10;
      obj2.bar.baz.push(4);

      let expected = {
        foo: { far: 10 },
        bar: { baz: [1, 2, 3, 4] },
      };

      expect(merged).toEqual(expected);
    });
  });

  describe("resolveSaveData", () => {
    const app_name = "App";
    const save_dir = "Save";

    const read_spy = jest.spyOn(fs, "readDir");
    const create_spy = jest.spyOn(fs, "createDir");
    const join_spy = jest.spyOn(path, "join");

    join_spy.mockResolvedValue("App/Save");

    it("finds an existing save dir", async () => {
      read_spy.mockResolvedValueOnce([{ name: app_name, path: "" }]);

      const p = await resolveSaveData(app_name)(save_dir);

      expect(read_spy).toBeCalledTimes(1);
      expect(create_spy).toBeCalledTimes(0);
      expect(p).toEqual("App/Save");
    });

    it("creates the save dir", async () => {
      const p = await resolveSaveData(app_name)(save_dir);

      expect(read_spy).toBeCalledTimes(1);
      expect(create_spy).toBeCalledTimes(2);
      expect(p).toEqual("App/Save");
    });
  });
});
