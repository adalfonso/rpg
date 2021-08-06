import { expect } from "chai";
import * as Sut from "@/level/LevelFixture";

describe("isBasicLevelFixtureTemplate", () => {
  [
    { label: "valid", template: getTemplate(), expected: true },
    {
      label: "missing x",
      template: { ...getTemplate(), x: undefined },
      expected: false,
    },
    {
      label: "missing y",
      template: { ...getTemplate(), y: undefined },
      expected: false,
    },
    {
      label: "missing height",
      template: { ...getTemplate(), height: undefined },
      expected: false,
    },
    {
      label: "missing width",
      template: { ...getTemplate(), width: undefined },
      expected: false,
    },
    {
      label: "invalid x",
      template: { ...getTemplate(), x: "20px" },
      expected: false,
    },
    {
      label: "invalid y",
      template: { ...getTemplate(), y: "20px" },
      expected: false,
    },
    {
      label: "invalid height",
      template: { ...getTemplate(), height: "20px" },
      expected: false,
    },
    {
      label: "invalid width",
      template: { ...getTemplate(), width: "20px" },
      expected: false,
    },
  ].forEach(({ label, template, expected }) => {
    it(`detects ${label}`, () => {
      expect(Sut.isBasicLevelFixtureTemplate(template)).to.eq(expected);
    });
  });
});

describe("isLevelFixtureTemplate", () => {
  [
    { label: "valid", template: getTemplate(), expected: true },

    {
      label: "missing name",
      template: { ...getTemplate(), name: undefined },
      expected: false,
    },
    {
      label: "missing type",
      template: { ...getTemplate(), type: undefined },
      expected: false,
    },

    {
      label: "invalid name",
      template: { ...getTemplate(), name: 1 },
      expected: false,
    },
    {
      label: "invalid type",
      template: { ...getTemplate(), type: 1 },
      expected: false,
    },
    {
      label: "invalid properties",
      template: { ...getTemplate(), properties: 1 },
      expected: false,
    },
  ].forEach(({ label, template, expected }) => {
    it(`detects ${label}`, () => {
      expect(Sut.isLevelFixtureTemplate(template)).to.eq(expected);
    });
  });
});

function getTemplate() {
  return { x: 1, y: 1, height: 1, width: 1, name: "foo", type: "bar" };
}
