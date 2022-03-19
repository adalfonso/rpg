import Sut from "@/ui/dialogue/TextStream";
//import Vector from "@/physics/math/Vector";

// TODO: Uncomment tests when able to mock canvas
describe("TextStream", () => {
  describe("isDone", () => {
    it("it detects when the stream is not done", () => {
      let sut = getSut();
      expect(sut.isDone).toBe(false);
    });

    // it("it detects the stream is done", () => {
    //   let sut = getSut();
    //   sut.fillBuffer(ctx, new Vector(12, 12));
    //   sut.tick(100);
    //   sut.next();
    //   sut.fillBuffer(ctx, new Vector(12, 12));
    //   sut.tick(100);

    //   expect(sut.isDone()).to.be.true;
    // });
  });

  describe("isEmpty", () => {
    it("it detects the buffer is empty", () => {
      let sut = getSut();
      expect(sut.isEmpty).toBe(true);
    });
    // it("it detects the buffer is full", () => {
    //   let sut = getSut();
    //   let { ctx, area, prefix } = getFillBufferParams();
    //   sut.fillBuffer(ctx, area, prefix);
    //   expect(sut.isEmpty()).to.be.true;
    // });
  });

  // describe("fillBuffer", () => {
  //   it("it fills the TextStream buffer", () => {
  //     let sut = getSut();
  //     let expected = ["test: hello,", "hello, 123"];

  //     sut.fillBuffer(ctx, new Vector(12, 12), "test: ");
  //     expect(sut.read()).to.deep.equal(expected);
  //   });
  // });

  // describe("next", () => {
  //   it("it prepares the stream for the next set of data", () => {
  //     let sut = getSut();
  //     sut.fillBuffer(ctx, new Vector(12, 12));
  //     sut.tick(100);

  //     expect(sut.fragment).to.equal("test: hello,");

  //     sut.next();

  //     expect(sut.fragment).to.equal("");
  //     expect(sut.read).to.deep.equal([]);
  //   });
  // });

  // describe("tick", () => {
  //   it("it advances the curent text by one character", () => {
  //     let sut = getSut();
  //     sut.fillBuffer(ctx, new Vector(12, 12));

  //     expect(sut.fragment).to.equal("");

  //     sut.tick(1);

  //     expect(sut.fragment).to.equal("t");

  //     sut.tick(1);

  //     expect(sut.fragment).to.equal("e");
  //   });

  //   it("it advances the curent text by multiple character", () => {
  //     let sut = getSut();
  //     sut.fillBuffer(ctx, new Vector(12, 12));

  //     expect(sut.fragment).to.equal("");

  //     sut.tick(100);

  //     expect(sut.fragment).to.equal("test: hello,");
  //   });
  // });
});

function getSut() {
  return new Sut(getData());
}

function getData() {
  return [
    "hello, hello, 123",
    "longer line of text that is more likely to wrap",
  ];
}
