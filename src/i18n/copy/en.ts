/**
 * English copy — the base locale.
 *
 * Keep in step with ru.ts: the Copy contract makes a missing string a type
 * error, but it cannot tell you a translation has gone stale. If you change a
 * claim here, change it there.
 *
 * TWO SECTIONS, ONE CARD PER GAME. `originals.items` are the games whose rules
 * were invented here; `classics.items` are the ones the world already knew.
 * Every game appears in exactly one of them, exactly once, and its `platforms`
 * say where you can play it — a second home is never a second card. Reversi is
 * the reason: it is live in Telegram AND in the browser, which used to make it
 * two cards in two per-surface sections. Shipping a 'soon' platform means
 * flipping its status to 'live' and giving it an href, never adding a card.
 *
 * The split is a claim about authorship, so it is not one to widen casually: a
 * game is a classic unless we invented its rules. Bidding Tic-Tac-Toe is the
 * near miss — our bidding twist, but on a board everybody already knows.
 *
 * Deep links: the Telegram platforms open a bot with a /start payload
 * (t.me/SneatBot?start=reversi | rps). SneatBot routes that payload straight
 * into the game. The Greed Game's own bot does not exist yet, so its card names
 * only the browser — add { kind: 'telegram', status: 'live',
 * href: 'https://t.me/GreedGameBot?start=play' } when @GreedGameBot ships, and
 * claim nothing about Telegram until then.
 *
 * The browser builds are the *.sneat.games game-kit family — see
 * game-kit/docs/DESIGN.md.
 *
 * Counts live in prose too: `classics.title` counts the classics, the ledes
 * count surfaces, and `ctaBand.text` counts the lot. Recount all three when a
 * game or a platform lands.
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
      'Two originals designed in-house — Chess Raiders and The Greed Game — plus the classics: Bidding Tic-Tac-Toe, Hex, Dots & Boxes, Reversi, Four in a Row, Gomoku, Ultimate Tic-Tac-Toe, Domineering and Y, all free in your browser, with Reversi and Rock-Paper-Scissors in Telegram. Solo against a bot or head-to-head with a friend. No install, no account.',
  },

  nav: [
    { label: 'Originals', href: '#originals' },
    { label: 'Classics', href: '#classics' },
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

  originals: {
    eyebrow: 'Made here',
    title: 'Originals by Sneat Games',
    lede: 'Two games you will not find anywhere else. Nobody was playing these before us: the rules are ours, not a fresh coat of paint on a game you already know. Both play in your browser right now — no install, no account.',
    items: [
      {
        icon: '♞',
        title: 'Chess Raiders',
        examples:
          'Real-time team chess with no turns and no check: raid the enemy line, escort prisoners home, intercept convoys, and capture the king to win. Play solo, 1v1 or whole teams.',
        platforms: [{ kind: 'browser', status: 'live', href: 'https://chessraiders.com' }],
      },
      {
        // Browser only, and deliberately: the bot is planned, not shipped, and
        // a 'soon' Telegram entry would still be a promise on a live page.
        icon: '💰',
        title: 'The Greed Game',
        examples:
          'A hidden-bid duel of nerve. The bolder bid takes the round — but bid more than twice what your opponent bid and greed loses it for you. The whole game is deciding how far to push.',
        platforms: [{ kind: 'browser', status: 'live', href: 'https://greed.sneat.games' }],
      },
    ],
  },

  classics: {
    eyebrow: 'The classics',
    title: 'Ten classics to play right now',
    lede: 'Games you already know, rebuilt to start in seconds. Nine of them run in your browser, each with a classic mode and a hidden-bid "bidding" mode: take on the computer, even offline, or send a friend a link. Rock · Paper · Scissors lives in Telegram. No install, no account.',
    items: [
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
          { kind: 'browser', status: 'live', href: 'https://reversi.sneat.games' },
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
        icon: '🔴',
        title: 'Four in a Row',
        examples:
          'Drop your discs down the columns and line up four in a row before your opponent does.',
        platforms: [{ kind: 'browser', status: 'live', href: 'https://four-in-a-row.sneat.games' }],
      },
      {
        icon: '⚪',
        title: 'Gomoku',
        examples: 'Place stones on an open board — the first to five in a row wins.',
        platforms: [{ kind: 'browser', status: 'live', href: 'https://gomoku.sneat.games' }],
      },
      {
        icon: '🔳',
        title: 'Ultimate Tic-Tac-Toe',
        examples:
          'Nine boards in one: win a square to send your opponent into the matching board next.',
        platforms: [{ kind: 'browser', status: 'live', href: 'https://ultimate-tictactoe.sneat.games' }],
      },
      {
        icon: '🟧',
        title: 'Domineering',
        examples:
          "Place dominoes across the grid — yours run one way, your opponent's the other — until someone runs out of room.",
        platforms: [{ kind: 'browser', status: 'live', href: 'https://domineering.sneat.games' }],
      },
      {
        icon: '🔺',
        title: 'Y',
        examples: 'Claim territory on a triangular board — connect all three sides to win.',
        platforms: [{ kind: 'browser', status: 'live', href: 'https://y.sneat.games' }],
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
    text: 'Twelve games — two of them ours alone. Open one in your browser or in Telegram and make your first move; it takes seconds.',
    cta: 'Browse the games',
  },

  footer: {
    tagline: 'Casual games, in Telegram and in your browser.',
    productTitle: 'Games',
    // Live games only, in the same order as the cards above — originals first,
    // then the classics: a footer link that isn't playable yet is a dead end.
    product: [
      { label: 'Chess Raiders', href: 'https://chessraiders.com' },
      { label: 'The Greed Game', href: 'https://greed.sneat.games' },
      { label: 'Bidding Tic-Tac-Toe', href: 'https://bidding-tictactoe.sneat.games' },
      { label: 'Hex', href: 'https://hex.sneat.games' },
      { label: 'Dots & Boxes', href: 'https://dots-and-boxes.sneat.games' },
      { label: 'Reversi', href: 'https://reversi.sneat.games' },
      { label: 'Rock-Paper-Scissors', href: 'https://t.me/SneatBot?start=rps' },
      { label: 'Four in a Row', href: 'https://four-in-a-row.sneat.games' },
      { label: 'Gomoku', href: 'https://gomoku.sneat.games' },
      { label: 'Ultimate Tic-Tac-Toe', href: 'https://ultimate-tictactoe.sneat.games' },
      { label: 'Domineering', href: 'https://domineering.sneat.games' },
      { label: 'Y', href: 'https://y.sneat.games' },
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
        body: 'This page describes our own game sites — the ones linked from sneat.games. The same games are also published on portals such as CrazyGames and itch.io: play there and that portal’s privacy policy applies alongside this one, and its own code runs next to the game. On our sites that code never loads.',
      },
      {
        title: 'Games in Telegram',
        body: 'Reversi and Rock-Paper-Scissors are played through @SneatBot, and the whole game sits inside the Telegram message itself — no game data is stored on our servers. The Greed Game plays in your browser today, under the sections above; if its own bot ships, that bot will keep a small game session (who is playing and the running score in play tokens) only while the game runs. Because you are playing inside Telegram, Telegram’s own privacy policy covers your Telegram account.',
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
