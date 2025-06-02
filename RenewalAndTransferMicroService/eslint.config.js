// eslint.config.js (place in the root of each TS service)
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { languageOptions: { globals: globals.node } }, // or browser, etc.
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  // Add any custom rules or overrides here
  // {
  //   rules: {
  //     "no-unused-vars": "warn", // Example custom rule
  //   }
  // }
];