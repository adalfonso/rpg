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

      let fooValue = 0;

      let foo = {
        register: () => {
          return {
            foo: (e: CustomEvent) => {
              fooValue++;
            },
          };
        },
      };

      sut.register(foo);

      expect(fooValue).to.equal(0);

      sut.emit("foo");

      expect(fooValue).to.equal(1);
    });
  });

  describe("unregister", () => {
    it("unregisters a fixture from the event bus", () => {
      let sut = getSut();

      let fooValue = 0;

      let foo = {
        register: () => {
          return {
            foo: (e: CustomEvent) => {
              fooValue++;
            },
          };
        },
      };

      sut.register(foo);

      expect(fooValue).to.equal(0);

      sut.emit("foo");
      sut.unregister(foo);
      sut.emit("foo");

      expect(fooValue).to.equal(1);
    });
  });

  describe("emit", () => {
    it("emits an event and detects it elsewhere", () => {
      let sut = getSut();

      let fooValue = 0;
      let barValue = 0;
      let emittedDetails = false;

      let fooParent = {
        foo: (e: CustomEvent) => {
          fooValue = 5;
        },
      };

      let foo = {
        register: () => {
          return {
            foo: (e: CustomEvent) => {
              fooParent.foo(e);
              fooValue += 10;

              if (e.detail?.bar === barValue) {
                emittedDetails = true;
                fooValue += barValue;
              }
            },
          };
        },
      };

      let bar = {
        register: () => {
          return {
            bar: (e: CustomEvent) => {
              if (barValue !== 10) {
                barValue = 10;
              } else {
                barValue = 100;
              }
              sut.emit("foo", { bar: barValue });
            },
          };
        },
      };

      sut.register(foo);
      sut.register(bar);

      expect(fooValue).to.equal(0);
      expect(barValue).to.equal(0);

      sut.emit("bar");
      sut.emit("bar");

      expect(fooValue).to.equal(115);
      expect(barValue).to.equal(100);
      expect(emittedDetails).to.be.true;
    });
  });
});

const getSut = () => {
  return new Sut();
};
