/**
 * Adapts this landing's copy layer to @sneat/astro's chrome contract: a
 * locale-independent SiteMeta (identity) and a per-locale SiteChrome (the words
 * the shared Header/Footer render). BaseLayout passes both down.
 */
import type { SiteMeta, SiteChrome } from '@sneat/astro/config';
import { getCopy } from './copy';
import type { LangCode } from './languages';

/** The bot the header CTA opens (Reversi + Rock-Paper-Scissors live here). */
const SNEAT_BOT = 'https://t.me/SneatBot';

export const siteMeta: SiteMeta = {
  name: 'Sneat Games',
  // Keep in step with astro.config `site:`.
  url: 'https://sneat.games',
  // Fallback only. SiteMeta is locale-independent, so this line can only ever be
  // one language; BaseLayout passes the page locale's own seoDescription as
  // `siteDescription`, and that is what reaches the JSON-LD graph.
  description: getCopy('en').site.seoDescription,
  companyUrl: 'https://sneat.co',
  // No app on this site, so no consent-banner GA is wired by default. Set an id
  // in BaseLayout to turn analytics on.
  gaMeasurementId: null,
  favicon: '/favicon.svg',
  // No root-mounted SPA — nothing to exclude from localisation.
  appRoutes: [],
};

export function getChrome(locale: LangCode): SiteChrome {
  const c = getCopy(locale);
  return {
    brand: c.site.brand,
    tld: c.site.tld,
    nav: c.nav,
    // Header CTA opens the bot directly (works from every page, unlike an anchor).
    cta: { href: SNEAT_BOT, label: c.site.navCta, labelShort: c.site.navCtaShort },
    footer: {
      tagline: c.footer.tagline,
      groups: [
        { title: c.footer.productTitle, links: c.footer.product },
        { title: c.footer.moreTitle, links: c.footer.more },
      ],
      owner: c.site.brand,
      ecosystemHref: siteMeta.companyUrl,
      ecosystemLabel: c.footer.legal.link,
    },
    a11y: {
      skipToContent: c.a11y.skipToContent,
      brandHome: c.a11y.brandHome,
      primaryNav: c.a11y.primaryNav,
    },
  };
}
