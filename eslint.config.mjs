import globals from "globals";
import pluginJs from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["./src/**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      sourceType: "module",
      globals: globals.browser,
      parser: tsParser,
    },
  },
  pluginJs.configs.recommended,
  tsPlugin.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      "*.log",
    ],
  },
];
