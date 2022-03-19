import { EventBus as Sut, EventType } from "@/event/EventBus";

describe("EventBus", () => {
  describe("getInstance", () => {
    it("shares the same instance", () => {
      expect(Sut.getInstance()).toBe(Sut.getInstance());
      expect(Sut.getInstance()).not.toBe(new Sut());
    });
  });

  describe("register", () => {
    it("registers a fixture with the event bus", () => {
      let sut = getSut();

      let fooValue = 0;

      let foo = {
        register: () => {
          return {
            [EventType.Custom]: {
              foo: (_e: CustomEvent) => {
                fooValue++;
              },
            },
          };
        },
      };

      sut.register(foo);

      expect(fooValue).toBe(0);

      sut.emit("foo");

      expect(fooValue).toBe(1);
    });
  });

  describe("unregister", () => {
    it("unregisters a fixture from the event bus", () => {
      let sut = getSut();

      let fooValue = 0;

      let foo = {
        register: () => {
          return {
            [EventType.Custom]: {
              foo: (_e: CustomEvent) => {
                fooValue++;
              },
            },
          };
        },
      };

      sut.register(foo);

      expect(fooValue).toBe(0);

      sut.emit("foo");
      sut.unregister(foo);
      sut.emit("foo");

      expect(fooValue).toBe(1);
    });
  });

  describe("emit", () => {
    it("emits an event and detects it elsewhere", () => {
      let sut = getSut();

      let fooValue = 0;
      let barValue = 0;
      let emittedDetails = false;

      let fooParent = {
        [EventType.Custom]: {
          foo: (_e: CustomEvent) => {
            fooValue = 5;
          },
        },
      };

      let foo = {
        register: () => {
          return {
            [EventType.Custom]: {
              foo: (e: CustomEvent) => {
                fooParent[EventType.Custom].foo(e);
                fooValue += 10;

                if (e.detail?.bar === barValue) {
                  emittedDetails = true;
                  fooValue += barValue;
                }
              },
            },
          };
        },
      };

      let bar = {
        register: () => {
          return {
            [EventType.Custom]: {
              bar: (_: CustomEvent) => {
                if (barValue !== 10) {
                  barValue = 10;
                } else {
                  barValue = 100;
                }
                sut.emit("foo", { bar: barValue });
              },
            },
          };
        },
      };

      sut.register(foo);
      sut.register(bar);

      expect(fooValue).toBe(0);
      expect(barValue).toBe(0);

      sut.emit("bar");
      sut.emit("bar");

      expect(fooValue).toBe(115);
      expect(barValue).toBe(100);
      expect(emittedDetails).toBe(true);
    });
  });
});

const getSut = () => {
  return new Sut();
};
