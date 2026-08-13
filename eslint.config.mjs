// ESLint flat config (v9+).
//
// Mirrors the game repos' config (see hex/web/eslint.config.mjs) so the
// landing is held to the same standard as the ten games it links to — it was
// the only repo in the fleet with no linting at all, which meant nothing here
// caught an unused import or an undefined reference before it shipped to the
// site's front door.
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default [
  {
    // Unanchored `**/.wrangler`, matching .gitignore: any worker dir gets its
    // own state dir full of generated bundles, and a root-anchored pattern
    // misses them (a lesson paid for in bidding-tictactoe).
    ignores: ["dist", "node_modules", ".astro", "**/.wrangler"],
  },
  js.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["src/**/*.ts", "*.config.ts", "*.config.mjs"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module" },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-undef": "off", // TS already handles this; DOM globals confuse eslint.
    },
  },
  {
    files: ["src/**/*.astro"],
    languageOptions: {
      parser: astro.parser,
      parserOptions: { extraFileExtensions: [".astro"] },
    },
  },
  {
    // worker.js is the Cloudflare entry point: plain JS, Workers runtime.
    files: ["worker.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
  },
];
