const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tests/tsconfig");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/tests/__mocks__/setup.ts"],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: "<rootDir>/tests/",
    }),
    "\\.(jpg|ico|jpeg|png|gif|svg|ttf|woff|woff2)$":
      "<rootDir>/tests/__mocks__/fileMock.js",
  },
};
