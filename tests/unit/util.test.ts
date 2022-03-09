import { lcFirst, ucFirst, merge, cloneByStringify } from "@/util";

describe("util", () => {
  describe("lcFirst", () => {
    it("lowercases the first character of a string", () => {
      [
        ["cat", "cat"],
        ["CAT", "cAT"],
        ["CAt", "cAt"],
      ].forEach((data) => {
        let [input, expected] = data;

        expect(lcFirst(input)).toBe(expected);
      });
    });
  });

  describe("ucFirst", () => {
    it("lowercases the first character of a string", () => {
      [
        ["cat", "Cat"],
        ["CAT", "CAT"],
        ["cAt", "CAt"],
      ].forEach((data) => {
        let [input, expected] = data;

        expect(ucFirst(input)).toBe(expected);
      });
    });
  });

  describe("merge", () => {
    it("merges two objects together", () => {
      let obj1 = {
        things: {
          thing1: 1,
          thing2: 2,
        },
      };

      let obj2 = {
        things: {
          thing2: "two",
          thing3: "three",
        },
      };

      let expected = {
        things: {
          thing1: 1,
          thing2: "two",
          thing3: "three",
        },
      };

      expect(merge(obj1, obj2)).toEqual(expected);
    });

    it("merges two complex objects together", () => {
      let obj1 = {
        foo: {
          bar: {
            baz: [1, 2, 3],
            buz: [1, 2, 3],
          },
          boo: {
            bat: {
              bim: 4,
            },
          },
          bif: {
            bod: {
              byte: "bip",
            },
          },
        },
      };

      let obj2 = {
        hey: 11,
        foo: {
          bar: {
            baz: [4, 5, 6],
          },
          boo: {
            bat: {
              bim: 5,
            },
          },
        },
      };

      let expected = {
        hey: 11,
        foo: {
          bar: {
            baz: [4, 5, 6],
            buz: [1, 2, 3],
          },
          boo: {
            bat: {
              bim: 5,
            },
          },
          bif: {
            bod: {
              byte: "bip",
            },
          },
        },
      };

      expect(merge(obj1, obj2)).toEqual(expected);
    });

    it("doesn't retain references to the inputs by default", () => {
      let obj1: any = {
        foo: {
          far: 1,
        },
      };

      let obj2: any = {
        bar: {
          baz: [1, 2, 3],
        },
      };

      let expected = {
        foo: {
          far: 1,
        },
        bar: {
          baz: [1, 2, 3],
        },
      };

      let merged = merge(obj1, obj2);

      obj1.foo.far = 10;
      obj2.bar.baz.push(4);

      expect(merged).toEqual(expected);
    });

    it("retains references to the inputs when requested", () => {
      let obj1: any = {
        foo: {
          far: 1,
        },
      };

      let obj2: any = {
        bar: {
          baz: [1, 2, 3],
        },
      };

      let merged = merge(obj1, obj2, true);

      obj1.foo.far = 10;
      obj2.bar.baz.push(4);

      let expected = {
        foo: {
          far: 10,
        },
        bar: {
          baz: [1, 2, 3, 4],
        },
      };

      expect(merged).toEqual(expected);
    });
  });

  describe("cloneByStringify", () => {
    it("clones a basic object", () => {
      let input: any = {
        number: 1,
        boolean: true,
        empty: null,
        nested: {
          nestedProp: "nestedProp",
        },
        array: [1, 2, 3, 4, true, "TRUE"],
      };

      let clone = cloneByStringify(input);

      expect(input).toEqual(clone);
      expect(input).not.toBe(clone);
    });
  });
});
