import { expect } from "chai";
import Sut from "@/EventBus";

describe("EventBus", () => {
  describe("getInstance", () => {
    it("shares the same instance", () => {
      expect(Sut.getInstance()).to.equal(Sut.getInstance());
      expect(Sut.getInstance()).to.not.equal(new Sut());
    });
  });

  describe("register", () => {
    it("registers a fixture with the event bus", () => {
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
  });

  describe("unregister", () => {
    it("unregisters a fixture from the event bus", () => {
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
  });

  describe("emit", () => {
    it("emits an event and detects it elsewhere", () => {
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
  });
});

const getSut = () => {
  return new Sut();
};
