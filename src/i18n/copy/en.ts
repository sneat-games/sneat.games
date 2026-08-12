/**
 * English copy — the base locale.
 *
 * Keep in step with ru.ts: the Copy contract makes a missing string a type
 * error, but it cannot tell you a translation has gone stale. If you change a
 * claim here, change it there.
 *
 * ONE CARD PER GAME. `games.items` lists every game exactly once; a game's
 * `platforms` say where you can play it. Reversi is the reason: it is live in
 * Telegram AND has a browser build coming, which used to make it two cards in
 * two sections. Shipping a 'soon' platform means flipping its status to 'live'
 * and giving it an href — never adding a second card somewhere else.
 *
 * Deep links: the Telegram platforms open a bot with a /start payload
 * (t.me/SneatBot?start=reversi | rps). SneatBot routes that payload straight
 * into the game. The Greed Game has no platform entry at all until
 * @GreedGameBot ships — give it { kind: 'telegram', status: 'live',
 * href: 'https://t.me/GreedGameBot?start=play' } then.
 *
 * The browser games are the *.sneat.games game-kit family — see
 * game-kit/docs/DESIGN.md.
 *
 * Counts live in prose too: `games.title` names how many games are playable
 * right now and the lede how many are still coming. Recount both when a
 * platform flips.
 */
import type { Copy } from './types';

export const en: Copy = {
  site: {
    brand: 'Sneat',
    tld: '.games',
    headline: 'Casual games, in Telegram or',
    headlineAccent: 'in your browser.',
    lede: 'Quick, friendly games — play instantly in Telegram or right in your browser, solo against a bot or head-to-head with a friend. No installs, no accounts, just play.',
    navCta: 'Play',
    navCtaShort: 'Play',
    ctaPrimary: 'Browse the games',
    ctaSecondary: 'How it works',
    microcopy: '🎮 Chat or browser · 🤖 Bot or friends · 🆓 Free to play',
    seoTitle: 'Sneat Games — casual games in Telegram and your browser',
    seoDescription:
      'Play Chess Raiders, Bidding Tic-Tac-Toe, Hex and Dots & Boxes free in your browser, or Reversi and Rock-Paper-Scissors inside Telegram — solo against a bot or head-to-head with a friend. No install, no account.',
  },

  nav: [
    { label: 'Games', href: '#games' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Why here', href: '#why' },
  ],

  howItWorks: {
    eyebrow: 'How it works',
    title: 'Playing takes seconds',
    steps: [
      { icon: '👆', title: 'Open a game', text: 'Pick a game below and open it — in your browser or in Telegram. No install, no signup.' },
      { icon: '🎯', title: 'Pick a mode', text: 'Play solo against the bot, or challenge a friend in a chat or with a share link.' },
      { icon: '💬', title: 'Make your move', text: 'The whole game sits on one page or in one message — tap to play your turn.' },
      { icon: '🔁', title: 'Play again', text: 'Rematch instantly, or jump into another game. Your move.' },
    ],
  },

  games: {
    eyebrow: 'The games',
    title: 'Six games to play right now',
    lede: 'Play in your browser or right inside Telegram — no install, no account. Every browser game has a classic mode and a hidden-bid "bidding" mode: take on the computer, even offline, or send a friend a link. Six more games are on the way.',
    items: [
      {
        icon: '♞',
        title: 'Chess Raiders',
        examples:
          'Real-time team chess with no turns and no check: raid the enemy line, escort prisoners home, intercept convoys, and capture the king to win. Play solo, 1v1 or whole teams.',
        platforms: [{ kind: 'browser', status: 'live', href: 'https://chessraiders.com' }],
      },
      {
        icon: '❌',
        title: 'Bidding Tic-Tac-Toe',
        examples:
          'Classic 3-in-a-row, plus a bidding mode where you can outbid your opponent for the square you both want.',
        platforms: [
          { kind: 'browser', status: 'live', href: 'https://bidding-tictactoe.sneat.games' },
        ],
      },
      {
        icon: '⬡',
        title: 'Hex',
        examples:
          'Connect your two sides of the board with an unbroken chain before your opponent connects theirs.',
        platforms: [{ kind: 'browser', status: 'live', href: 'https://hex.sneat.games' }],
      },
      {
        icon: '🔲',
        title: 'Dots & Boxes',
        examples:
          'Draw an edge, complete a box and go again — or bid for the right to choose who plays next.',
        platforms: [
          { kind: 'browser', status: 'live', href: 'https://dots-and-boxes.sneat.games' },
        ],
      },
      {
        // The card that merged the two old sections: one game, two homes.
        icon: '⚫',
        title: 'Reversi',
        examples:
          'The classic disc-flipping strategy game. Pick your colour, play against an AI or a random opponent, and outflank the board to own the most discs.',
        platforms: [
          { kind: 'telegram', status: 'live', href: 'https://t.me/SneatBot?start=reversi' },
          { kind: 'browser', status: 'soon', href: 'https://reversi.sneat.games' },
        ],
      },
      {
        icon: '✊',
        title: 'Rock · Paper · Scissors',
        examples:
          'The timeless hand game over an endless streak, with a running win–draw–loss score. The AI learns your habits — so keep it unpredictable.',
        platforms: [{ kind: 'telegram', status: 'live', href: 'https://t.me/SneatBot?start=rps' }],
      },
      {
        // No platform entry yet: @GreedGameBot doesn't exist, so the card says
        // "on the roadmap" rather than naming a surface it can't deliver.
        icon: '💰',
        title: 'The Greed Game',
        examples:
          'A hidden-bid game of nerve for a group: bid low to play it safe, or make a bold leap. Courage is rewarded, greed is punished. An original — coming to its own bot.',
        platforms: [],
      },
      {
        icon: '🔴',
        title: 'Four in a Row',
        examples:
          'Drop your discs down the columns and line up four in a row before your opponent does.',
        platforms: [{ kind: 'browser', status: 'soon' }],
      },
      {
        icon: '⚪',
        title: 'Gomoku',
        examples: 'Place stones on an open board — the first to five in a row wins.',
        platforms: [{ kind: 'browser', status: 'soon' }],
      },
      {
        icon: '🔳',
        title: 'Ultimate Tic-Tac-Toe',
        examples:
          'Nine boards in one: win a square to send your opponent into the matching board next.',
        platforms: [{ kind: 'browser', status: 'soon' }],
      },
      {
        icon: '🟧',
        title: 'Domineering',
        examples:
          "Place dominoes across the grid — yours run one way, your opponent's the other — until someone runs out of room.",
        platforms: [{ kind: 'browser', status: 'soon' }],
      },
      {
        icon: '🔺',
        title: 'Y',
        examples: 'Claim territory on a triangular board — connect all three sides to win.',
        platforms: [{ kind: 'browser', status: 'soon' }],
      },
    ],
  },

  cardLabels: {
    live: 'Live now',
    soon: 'Coming soon',
    roadmap: 'On the roadmap',
    play: { browser: 'Play in browser', telegram: 'Play in Telegram' },
    coming: { browser: 'Coming to browser', telegram: 'Coming to Telegram' },
  },

  why: {
    eyebrow: 'Why here',
    title: 'Games that fit your day',
    tiles: [
      { icon: '📲', title: 'Nothing to install' },
      { icon: '⚡', title: 'Play in seconds' },
      { icon: '👥', title: 'Great with friends' },
      { icon: '🤖', title: 'Smart bot opponents' },
      { icon: '🆓', title: 'Free to play' },
      { icon: '🎲', title: 'Play tokens only — just for fun' },
    ],
  },

  ctaBand: {
    title: 'Ready to play?',
    text: 'Open a game in Telegram or your browser and make your first move — it takes seconds.',
    cta: 'Browse the games',
  },

  footer: {
    tagline: 'Casual games, in Telegram and in your browser.',
    productTitle: 'Games',
    // Live games only, in the same order as the cards above: a footer link that
    // isn't playable yet is a dead end.
    product: [
      { label: 'Chess Raiders', href: 'https://chessraiders.com' },
      { label: 'Bidding Tic-Tac-Toe', href: 'https://bidding-tictactoe.sneat.games' },
      { label: 'Hex', href: 'https://hex.sneat.games' },
      { label: 'Dots & Boxes', href: 'https://dots-and-boxes.sneat.games' },
      { label: 'Reversi', href: 'https://t.me/SneatBot?start=reversi' },
      { label: 'Rock-Paper-Scissors', href: 'https://t.me/SneatBot?start=rps' },
      { label: 'All games', href: '#games' },
      { label: 'How it works', href: '#how-it-works' },
    ],
    moreTitle: 'More',
    more: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
    legal: { before: 'built on the ', link: 'Sneat platform', after: '.' },
  },

  privacyPage: {
    seoTitle: 'Privacy — Sneat Games',
    seoDescription:
      'How Sneat Games handles your information: play in your browser or in Telegram, with no account and as little data as possible.',
    eyebrow: 'Privacy',
    title: 'Your information, handled with care',
    lede: 'Some of our games run in your browser, others inside Telegram. Either way you can start playing straight away: the browser games ask for no account, no sign-in and no personal details, and we keep only what a game genuinely needs.',
    sections: [
      {
        title: 'What stays in your browser',
        body: 'Play a browser game and nothing about you is sent to us. Your theme choice and your win–loss record against the bot are saved in your own browser, on that device only — never uploaded, never synced anywhere, and gone the moment you clear the site’s data. Each game also keeps a copy of its own files on your device, which is what lets you play the bot with no connection at all.',
      },
      {
        title: 'Playing a friend',
        body: 'When you invite a friend, the two browsers talk to each other directly. We hand out a short room code and pass the two browsers’ connection details between them; those details sit in temporary storage that expires after five minutes and is then gone. There is no database and no account behind it, and the moves themselves never reach our servers — they travel straight from one browser to the other.',
      },
      {
        title: 'What a direct connection means',
        body: 'Worth saying plainly: any direct connection between two devices means they learn each other’s network address, so someone you invite can see your IP address. That is how direct connections work everywhere — it is not something we add — and it is the trade for keeping your moves off our servers entirely. Anyone holding a room link can join that room, so share it only with the people you want to play.',
      },
      {
        title: 'What we do not do',
        body: 'There are no analytics on this site today, no advertising trackers, and nothing about you is sold or handed to anyone. If we ever turn analytics on it will be the privacy-respecting kind, this page will say so, and visitors in the EU, the EEA and the UK will be asked before anything is measured.',
      },
      {
        title: 'Where you play',
        body: 'What is described here is our own game sites — the ones linked from sneat.games. The same games are also published on portals such as CrazyGames and itch.io: play there and that portal’s privacy policy applies alongside this one, and its own code runs next to the game. On our sites that code never loads.',
      },
      {
        title: 'Games in Telegram',
        body: 'Reversi and Rock-Paper-Scissors are played through @SneatBot, and the whole game sits inside the Telegram message itself — no game data is stored on our servers. The Greed Game, once it ships, keeps a small game session (who is playing and the running score in play tokens) only while the game runs. Because you are playing inside Telegram, Telegram’s own privacy policy covers your Telegram account.',
      },
      {
        title: 'Hosting',
        body: 'The sites are served through Cloudflare, which keeps the standard technical logs of requests that any web host keeps. That is the ordinary machinery of putting a site on the internet.',
      },
      {
        title: 'Play tokens, not money',
        body: 'Bidding budgets, scores and tokens are play money with no real-world value. There is nothing to pay for, nothing to cash out, and no gambling anywhere in it.',
      },
    ],
    early: {
      title: 'This is an early page',
      body: 'Sneat Games is in active development, and this page will grow as it launches. Questions in the meantime? Reach us via the',
      linkLabel: 'Sneat platform',
    },
    back: '← Back to home',
  },

  termsPage: {
    seoTitle: 'Terms — Sneat Games',
    seoDescription:
      'The rules of the road for Sneat Games: casual games in your browser and in Telegram, play tokens only, not gambling.',
    eyebrow: 'Terms',
    title: 'The rules of the road',
    lede: 'The short version: these are casual games for fun. Play nicely, and enjoy them.',
    updated: 'Last updated: 12 August 2026',
    sections: [
      {
        title: 'What this is, and what it is not',
        body: 'Sneat Games is a set of casual games — some played in your browser, some inside Telegram. Scores, bidding budgets and the Greed Game’s winnings are play tokens with no monetary value. This is not gambling, not a betting service, and nothing you win or lose is worth real money.',
      },
      {
        title: 'Playing',
        body: 'On our own sites there is no account to create and nothing to install: open a game and play, against the bot or with a friend over a shared link. Play in Telegram and Telegram’s own terms apply to your account; play the same games on a portal such as CrazyGames or itch.io and that portal’s terms apply there too. Wherever you play, be decent to the people you play with; abuse or attempts to break the games may get you blocked from them.',
      },
      {
        title: 'No warranties, and things change',
        body: 'The games are provided as-is and may be wrong or unavailable at times. Games and rules may change, and new games may be added. We’ll flag material changes to these terms rather than quietly swapping the page.',
      },
    ],
    early: {
      title: 'This is an early page',
      body: 'Sneat Games is in active development, and these terms will grow as it launches. They deliberately carry no legal entity, jurisdiction or liability clauses yet — those need a real entity and a lawyer, not a template. Questions in the meantime? Reach us via the',
      linkLabel: 'Sneat platform',
    },
    back: '← Back to home',
  },

  langLabel: 'Language',

  a11y: {
    skipToContent: 'Skip to content',
    primaryNav: 'Primary',
    brandHome: 'Sneat Games home',
    productNav: 'Games',
    moreNav: 'More',
  },
};
