import { expect } from "chai";
import Sut from "../../src/renderer/ts/EventBus";

describe("EventBus", () => {
  it("register", () => {
    let sut = getSut();

    let fooFired = 0;

    let foo = {
      register: () => {
        return {
          foo: (e) => {
            fooFired++;
          },
        };
      },
    };

    sut.register(foo);

    expect(fooFired).to.equal(0);

    sut.emit("foo");

    expect(fooFired).to.equal(1);
  });

  it("unregister", () => {
    let sut = getSut();

    let fooFired = 0;

    let foo = {
      register: () => {
        return {
          foo: (e) => {
            fooFired++;
          },
        };
      },
    };

    sut.register(foo);

    expect(fooFired).to.equal(0);

    sut.emit("foo");
    sut.unregister(foo);
    sut.emit("foo");

    expect(fooFired).to.equal(1);
  });

  it("emit", () => {
    let sut = getSut();

    let fooFired = 0;
    let barFired = 0;
    let emittedDetails = false;

    let foo = {
      register: () => {
        return [
          {
            foo: (e) => {
              fooFired++;
            },
          },
          {
            foo: (e) => {
              fooFired += 10;

              if (e.detail.bar === bar) {
                emittedDetails = true;
              }
            },
          },
        ];
      },
    };

    let bar = {
      register: () => {
        return {
          bar: (e) => {
            barFired++;
            sut.emit("foo", { bar: bar });
          },
        };
      },
    };

    sut.register(foo);
    sut.register(bar);

    expect(fooFired).to.equal(0);
    expect(barFired).to.equal(0);

    sut.emit("bar");
    sut.emit("bar");

    expect(fooFired).to.equal(22);
    expect(barFired).to.equal(2);
    expect(emittedDetails).to.be.true;
  });

  it("getInstance (singleton)", () => {
    expect(Sut.getInstance()).to.equal(Sut.getInstance());
    expect(Sut.getInstance()).to.not.equal(new Sut());
  });
});

const getSut = () => {
  return new Sut();
};
