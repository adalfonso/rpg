import { SpeechList } from "@/actor/types";
import { expect } from "chai";
import { getSpeech } from "@/actor/speech";

describe("getSpeech", () => {
  it("gets speech", () => {
    expect(getSpeech("foo.foo", getSpeechList())).to.deep.equal({
      dialogue: ["foo speech"],
    });
  });

  it("gets undefined when type is invalid", () => {
    expect(getSpeech("invalid.foo", getSpeechList())).to.equal(undefined);
  });

  it("gets undefined when name is invalid", () => {
    expect(getSpeech("foo.invalid", getSpeechList())).to.equal(undefined);
  });
});

const getSpeechList = (): SpeechList => ({
  foo: {
    foo: {
      dialogue: ["foo speech"],
    },
  },
});
