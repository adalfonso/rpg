import { SpeechList } from "@/actor/types";
import { getSpeech } from "@/actor/speech";

describe("getSpeech", () => {
  it("gets speech", () => {
    expect(getSpeech("foo.foo", getSpeechList())).toEqual({
      dialogue: ["foo speech"],
    });
  });

  it("gets undefined when type is invalid", () => {
    expect(getSpeech("invalid.foo", getSpeechList())).toBeUndefined();
  });

  it("gets undefined when name is invalid", () => {
    expect(getSpeech("foo.invalid", getSpeechList())).toBeUndefined();
  });
});

const getSpeechList = (): SpeechList => ({
  foo: {
    foo: {
      dialogue: ["foo speech"],
    },
  },
});
