/**
 * The contract every locale must satisfy to render this landing.
 *
 * Why a copy layer at all, rather than per-locale page variants (IndexRu.astro,
 * IndexEs.astro…)? Because the homepage is a single page whose prose is
 * threaded through its markup — forking it per locale means maintaining N
 * copies of the layout to change N copies of the words, and every structural
 * fix has to land N times. So: one template, N copy modules.
 *
 * TODO(copy): this ships as a generic skeleton. Replace the strings in en.ts
 * and ru.ts with your product's real messaging — but keep the SHAPE. Adding a
 * field here is what forces every locale to supply it; the type-checker is the
 * only thing standing between you and a half-translated page.
 *
 * Deleting a section you don't need is fine — remove it from this interface and
 * every locale module at the same time, and `astro check` will confirm you got
 * them all.
 */

/** A nav/footer link. `href` is locale-independent; pass it through localeHref. */
export interface LinkCopy {
  label: string;
  /** Either a page route ('/privacy') or a same-page anchor ('#games'). */
  href: string;
}

export interface StepCopy {
  /** Emoji live in the copy because a locale may want a different one. */
  icon: string;
  title: string;
  text: string;
}

/**
 * Somewhere a game can be played.
 *
 * Adding a kind here is deliberately expensive: `cardLabels.play` and
 * `cardLabels.coming` are keyed by it, so every locale is forced to name the
 * new surface before the build goes green.
 */
export type PlatformKind = 'browser' | 'telegram';

/**
 * One home for one game. A game may have several — Reversi is live in Telegram
 * while its browser build is still in progress — which is exactly why a card
 * carries a LIST of these rather than a single status/href/cta triplet.
 */
export interface PlatformCopy {
  kind: PlatformKind;
  /** 'live' renders a link; 'soon' renders a muted "coming to …" note. */
  status: 'live' | 'soon';
  /**
   * Only rendered when status is 'live' — but record the known future URL even
   * while a game is 'soon': shipping it is then a one-word edit, and until then
   * the card never links somewhere that 404s.
   */
  href?: string;
}

/**
 * ONE CARD PER GAME. The card names the game, describes it, and lists every way
 * to play it — so a game with two homes is still a single card, not one card
 * per surface.
 *
 * No live platform (none at all, or every one still 'soon') ⇒ the card renders
 * a "coming soon" pill and no links.
 */
export interface GameCopy {
  icon: string;
  title: string;
  /** The sentence under the title. */
  examples: string;
  platforms: PlatformCopy[];
}

/**
 * The games section: an eyebrow + title over a grid of ServiceCards.
 *
 * There is exactly ONE of these (anchor `#games`). It used to be two — a
 * Telegram section and a browser section — which listed Reversi twice, once per
 * surface. Where a game is playable is a property OF THE GAME (see
 * PlatformCopy), not a reason to split the page.
 */
export interface GameSectionCopy {
  eyebrow: string;
  title: string;
  /** Optional paragraph under the title — shared context for every card below,
   * so individual card copy doesn't have to repeat it. */
  lede?: string;
  items: GameCopy[];
}

/**
 * A plain legal page: /{locale}/privacy/ and /{locale}/terms/ share this shape
 * and render through the same component (Legal.astro).
 *
 * CLAIMS DISCIPLINE — every string here must be true and checkable, IN EVERY
 * LANGUAGE. A translation is a fresh chance to promise something you don't do.
 * Tighten a claim in one locale, tighten it in all of them, same commit.
 */
export interface LegalPageCopy {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  lede: string;
  /** Optional dated line. Terms want one; privacy generally doesn't. */
  updated?: string;
  sections: { title: string; body: string }[];
  /** The closing honesty note — and the honest admission it's a stub. */
  early: { title: string; body: string; linkLabel: string };
  back: string;
}

export interface Copy {
  /** Hero + shared CTA furniture. */
  site: {
    /** Wordmark. Usually NOT translated — a brand name is not prose. */
    brand: string;
    /** Optional TLD span rendered in the accent colour, e.g. '.app'. */
    tld?: string;
    /** Split so the accent span can wrap only the second half. */
    headline: string;
    headlineAccent: string;
    lede: string;
    /** Header button. */
    navCta: string;
    /**
     * Header button on narrow screens. Required, not optional: English verbs
     * are unusually short and every other locale will be longer, so the header
     * can't be tuned per language — it asks each locale for a short form.
     * Keep the verb, drop the object: "Sign in" / «Войти».
     */
    navCtaShort: string;
    ctaPrimary: string;
    ctaSecondary: string;
    /** The trust line under the hero CTAs. */
    microcopy: string;
    /** Default <title> and meta description for the home page. */
    seoTitle: string;
    seoDescription: string;
  };

  nav: LinkCopy[];

  howItWorks: { eyebrow: string; title: string; steps: StepCopy[] };

  /** Every game, listed exactly once, with the places you can play it. */
  games: GameSectionCopy;

  /**
   * Localised labels for the ServiceCard pill/CTA furniture — a card's status
   * and its surfaces are structural (live/soon, browser/telegram), not per-item
   * prose, so their wording lives here once instead of on every item.
   *
   * Every user-visible word the card renders comes from here. Do not reintroduce
   * an English literal into ServiceCard.astro: that is precisely how the status
   * pills once shipped untranslated on the Russian page.
   */
  cardLabels: {
    /** Pill, when at least one platform is live. */
    live: string;
    /** Pill, when none is. */
    soon: string;
    /** Bottom-of-card note for a game with no announced surface at all. */
    roadmap: string;
    /** The CTA per live platform: "Play in browser" / "Play in Telegram". */
    play: Record<PlatformKind, string>;
    /** The note per 'soon' platform: "Coming to browser" / "Coming to Telegram". */
    coming: Record<PlatformKind, string>;
  };

  why: { eyebrow: string; title: string; tiles: { icon: string; title: string }[] };

  ctaBand: { title: string; text: string; cta: string };

  footer: {
    /** One line under the wordmark. */
    tagline: string;
    productTitle: string;
    product: LinkCopy[];
    moreTitle: string;
    more: LinkCopy[];
    /** Split so "Sneat platform" can be a link without HTML in the copy. */
    legal: { before: string; link: string; after: string };
  };

/**
 * A plain legal page: /{locale}/privacy/ and /{locale}/terms/ share this shape
 * and render through the same component.
 */
  /** /{locale}/privacy/ */
  privacyPage: LegalPageCopy;

  /** /{locale}/terms/ */
  termsPage: LegalPageCopy;

  /** Language switcher a11y label. */
  langLabel: string;

  /**
   * Strings only assistive tech ever reads. They translate too: a Russian
   * screen-reader user hitting "Skip to content" is being served an English
   * page they can't see.
   */
  a11y: {
    skipToContent: string;
    primaryNav: string;
    /** aria-label on the wordmark. */
    brandHome: string;
    productNav: string;
    moreNav: string;
  };
}
