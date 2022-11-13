const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("../tsconfig");

module.exports = {
  rootDir: "../",
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/tests/__mocks__/setup.ts"],
  moduleNameMapper: {
    // This mock needs to come first or else it conflicts with @ from tsconfig
    "\\.(jpg|ico|jpeg|png|gif|svg|ttf|woff|woff2)$":
      "<rootDir>/tests/__mocks__/fileMock.ts",
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  },
};
