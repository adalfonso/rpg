import Sut from "@/item/Item";

describe("item/Item", () => {
  describe("get displayAs", () => {
    it("gets the dialogue name of the item", () => {
      let sut = getSut();
      let expected = "Big Sword";

      expect(sut.displayAs).toBe(expected);
    });
  });
});

const getSut = () => {
  let itemType = "big_sword";

  return new Sut(itemType);
};
