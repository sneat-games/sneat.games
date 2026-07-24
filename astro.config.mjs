import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { createSitemapConfig } from "@sneat/astro/scripts/sitemap.mjs";

// Apex domain — feeds canonical URLs, Open Graph URLs, and the generated
// sitemap. PUBLIC_SITE_URL overrides it at build time (CI sets it from a repo
// variable); keep it and the `locales` below in step with src/i18n/languages.ts.
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://sneat.games";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: "static",
  outDir: "./dist",
  integrations: [
    // Each entry carries the whole hreflang cluster (en, ru, x-default), with
    // the default locale's home as the bare `/`.
    sitemap(
      createSitemapConfig({
        site: SITE_URL,
        locales: ["en", "ru"],
        defaultLocale: "en",
      }),
    ),
  ],
});
