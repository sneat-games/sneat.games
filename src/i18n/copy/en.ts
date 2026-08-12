/**
 * English copy — the base locale.
 *
 * Keep in step with ru.ts: the Copy contract makes a missing string a type
 * error, but it cannot tell you a translation has gone stale. If you change a
 * claim here, change it there.
 *
 * Deep links: the "Play in Telegram" buttons open a bot with a /start payload
 * (t.me/SneatBot?start=reversi | rps). SneatBot routes that payload straight
 * into the game. The Greed Game is 'soon' until @GreedGameBot ships — flip it
 * to 'live' with href 'https://t.me/GreedGameBot?start=play' then.
 *
 * The browser games (browserGames.items) are the *.sneat.games game-kit
 * family — see game-kit/docs/DESIGN.md. Bidding Tic-Tac-Toe is 'live' at
 * bidding-tictactoe.sneat.games; the rest deploy over the next days — flip
 * each to 'live' with its subdomain href + a cta once it ships.
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
      'Play Chess Raiders, Reversi, Rock-Paper-Scissors and the Greed Game in Telegram, or Bidding Tic-Tac-Toe and more free strategy games right in your browser — solo against a bot or with a friend. No install, free to play.',
  },

  nav: [
    { label: 'Games', href: '#games' },
    { label: 'Browser games', href: '#browser-games' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Why here', href: '#why' },
  ],

  howItWorks: {
    eyebrow: 'How it works',
    title: 'Playing takes seconds',
    steps: [
      { icon: '👆', title: 'Open a game', text: 'Tap a game below to open it in Telegram — no install, no signup.' },
      { icon: '🎯', title: 'Pick a mode', text: 'Play solo against the bot, or challenge a friend in any chat.' },
      { icon: '💬', title: 'Make your move', text: 'The whole game lives in one message — tap to play your turn.' },
      { icon: '🔁', title: 'Play again', text: 'Rematch instantly, or jump into another game. Your move.' },
    ],
  },

  features: {
    eyebrow: 'The games',
    title: 'Four games to play right now',
    items: [
      {
        icon: '♞',
        title: 'Chess Raiders',
        examples:
          'Real-time team chess with no turns and no check: raid the enemy line, escort prisoners home, intercept convoys, and capture the king to win. Play solo, 1v1 or whole teams.',
        status: 'live',
        href: 'https://chessraiders.com',
        cta: 'Play Chess Raiders',
      },
      {
        icon: '⚫',
        title: 'Reversi',
        examples:
          'The classic disc-flipping strategy game. Pick your colour, play against an AI or a random opponent, and outflank the board to own the most discs.',
        status: 'live',
        href: 'https://t.me/SneatBot?start=reversi',
        cta: 'Play in Telegram',
      },
      {
        icon: '✊',
        title: 'Rock · Paper · Scissors',
        examples:
          'The timeless hand game over an endless streak, with a running win–draw–loss score. The AI learns your habits — so keep it unpredictable.',
        status: 'live',
        href: 'https://t.me/SneatBot?start=rps',
        cta: 'Play in Telegram',
      },
      {
        icon: '💰',
        title: 'The Greed Game',
        examples:
          'A hidden-bid game of nerve for a group: bid low to play it safe, or make a bold leap. Courage is rewarded, greed is punished. An original — coming to its own bot.',
        status: 'soon',
      },
    ],
  },

  browserGames: {
    eyebrow: 'Play in your browser',
    title: 'A growing family of strategy games',
    lede: 'Every game ships with a classic mode and a hidden-bid "bidding" mode. Play against the computer — even offline — or invite a friend with a share link. No account, ever.',
    items: [
      {
        icon: '❌',
        title: 'Bidding Tic-Tac-Toe',
        examples:
          'Classic 3-in-a-row, plus a bidding mode where you can outbid your opponent for the square you both want.',
        status: 'live',
        href: 'https://bidding-tictactoe.sneat.games',
        cta: 'Play in browser',
      },
      {
        icon: '🔲',
        title: 'Dots & Boxes',
        examples:
          'Draw an edge, complete a box and go again — or bid for the right to choose who plays next.',
        status: 'soon',
      },
      {
        icon: '⬡',
        title: 'Hex',
        examples:
          'Connect your two sides of the board with an unbroken chain before your opponent connects theirs.',
        status: 'soon',
      },
      {
        icon: '⚫',
        title: 'Reversi',
        examples:
          'The classic disc-flipping strategy game — same rules as in Telegram, now playable straight in your browser.',
        status: 'soon',
      },
      {
        icon: '🔴',
        title: 'Four in a Row',
        examples:
          'Drop your discs down the columns and line up four in a row before your opponent does.',
        status: 'soon',
      },
      {
        icon: '⚪',
        title: 'Gomoku',
        examples: 'Place stones on an open board — the first to five in a row wins.',
        status: 'soon',
      },
      {
        icon: '🔳',
        title: 'Ultimate Tic-Tac-Toe',
        examples:
          'Nine boards in one: win a square to send your opponent into the matching board next.',
        status: 'soon',
      },
      {
        icon: '🟧',
        title: 'Domineering',
        examples:
          "Place dominoes across the grid — yours run one way, your opponent's the other — until someone runs out of room.",
        status: 'soon',
      },
      {
        icon: '🔺',
        title: 'Y',
        examples: 'Claim territory on a triangular board — connect all three sides to win.',
        status: 'soon',
      },
    ],
  },

  cardLabels: {
    live: 'Live now',
    soon: 'Coming soon',
    roadmap: 'On the roadmap',
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
    product: [
      { label: 'Chess Raiders', href: 'https://chessraiders.com' },
      { label: 'Reversi', href: 'https://t.me/SneatBot?start=reversi' },
      { label: 'Rock-Paper-Scissors', href: 'https://t.me/SneatBot?start=rps' },
      { label: 'Bidding Tic-Tac-Toe', href: 'https://bidding-tictactoe.sneat.games' },
      { label: 'All games', href: '#games' },
      { label: 'Browser games', href: '#browser-games' },
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
      'How Sneat Games handles your information: play in a chat, with as little data as possible.',
    eyebrow: 'Privacy',
    title: 'Your information, handled with care',
    lede: 'These are games you play inside Telegram. We keep as little as the game needs and nothing more.',
    sections: [
      {
        title: 'What we keep',
        body: 'Reversi and Rock-Paper-Scissors carry the whole game inside the Telegram message itself — no game data is stored on our servers. The Greed Game keeps a small game session (who is playing and the running score in play tokens) only while the game runs.',
      },
      {
        title: 'What we do not do',
        body: 'No ads, no trackers, and we never sell your data. We do not ask for anything beyond what Telegram already gives a bot to play a game with you.',
      },
      {
        title: 'Play tokens, not money',
        body: 'Scores are play tokens with no real-world value. There is nothing to pay for and nothing to cash out.',
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
      'The rules of the road for Sneat Games: casual games for fun, play tokens only, not gambling.',
    eyebrow: 'Terms',
    title: 'The rules of the road',
    lede: 'The short version: these are casual games for fun. Play nicely, and enjoy them.',
    updated: 'Last updated: 24 July 2026',
    sections: [
      {
        title: 'What this is, and what it is not',
        body: 'Sneat Games is a set of casual games played inside Telegram. Scores — including the Greed Game’s bids and winnings — are play tokens with no monetary value. This is not gambling, not a betting service, and nothing you win or lose is worth real money.',
      },
      {
        title: 'Playing',
        body: 'You play through Telegram, so Telegram’s own terms apply to your account. Be decent to the people you play with; abuse or attempts to break the games may get you blocked from them.',
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
