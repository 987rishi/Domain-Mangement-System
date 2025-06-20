// const { createDefaultPreset } = require("ts-jest");
import { createDefaultPreset } from "ts-jest";
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  roots: ["<rootDir>/src"],
  collectCoverage: true,

  // 2. Specify the output directory for the report
  coverageDirectory: "coverage",

  // 3. This is the most important part: Tell Jest to create an 'lcov' report,
  //    which is the format SonarQube understands. 'text' is useful for the console.
  coverageReporters: ["text", "lcov"],

  // Optional but recommended: Exclude config files, index files, etc. from coverage stats
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/src/config/",
    "/src/index.ts" // Or your main entrypoint file
  ]
};