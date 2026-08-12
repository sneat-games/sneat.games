# sneat.games

Landing page for **Sneat Games** — casual games you play in your browser or
right inside Telegram.

Built from the Sneat landing pattern: [Astro](https://astro.build) static site,
bilingual (en + ru) on the [`@sneat/astro`](https://www.npmjs.com/package/@sneat/astro)
shared chrome, deployed to a Cloudflare Worker.

## The games

**One card per game.** The page has a single games section (`#games`); where a
game can be played is a `platforms` list on that game, not a section of its own.
That is why Reversi — live in Telegram, browser build still coming — is one card
listing both, rather than the two cards in two sections it used to be.

| Game | Browser | Telegram |
|---|---|---|
| Chess Raiders | [chessraiders.com](https://chessraiders.com) | — |
| Bidding Tic-Tac-Toe | `bidding-tictactoe.sneat.games` | — |
| Hex | `hex.sneat.games` | — |
| Dots & Boxes | `dots-and-boxes.sneat.games` | — |
| Reversi | `reversi.sneat.games` *(soon)* | `t.me/SneatBot?start=reversi` |
| Rock-Paper-Scissors | — | `t.me/SneatBot?start=rps` |
| The Greed Game | — | @GreedGameBot *(soon)* |
| Four in a Row, Gomoku, Ultimate Tic-Tac-Toe, Domineering, Y | *(soon)* | — |

The `?start=<payload>` deep links rely on SneatBot routing the `/start` payload
straight into the game. The browser games are the `*.sneat.games` game-kit
family (see `game-kit/docs/DESIGN.md`).

**Shipping a game** is a one-line edit in `src/i18n/copy/{en,ru}.ts`: flip that
game's platform from `status: 'soon'` to `status: 'live'` and give it an `href`.
Never add a second card for a second surface. Two counts live in prose and need
recounting at the same time: `games.title` (how many are playable now) and
`games.lede` (how many are still coming) — in **both** locales.

## Develop

```bash
pnpm install
pnpm dev        # local dev server
pnpm build      # astro check + static build into ./dist
pnpm preview    # preview the built site
```

## Editing content

- **Copy** — `src/i18n/copy/en.ts` and `ru.ts` (against the `Copy` contract in
  `types.ts`; a missing string is a type error). The games are the
  `games.items` list; every word a card renders — including "Play in browser"
  and "Coming soon" — comes from `cardLabels`, so it translates.
- **Theme** — `src/styles/tokens.css` (one place to re-colour).
- **Structure** — `src/components/Home.astro`.
- **Legal** — the privacy/terms copy lives in the same copy files.

Adding a locale is a five-step change; see the header of `src/i18n/languages.ts`
(and keep `RESERVED_LOCALES` in `worker.js` in step).

## Deploy

`.github/workflows/deploy.yml` deploys on push to `main` via the shared
`sneat-co/cicd` `cf-deploy` workflow. It needs, on the **sneat-games org**:

1. `CLOUDFLARE_API_TOKEN` — org **secret**.
2. `CLOUDFLARE_ACCOUNT_ID` — org **variable**.
3. Actions policy allowing reusable workflows from `sneat-co/cicd`.

Until those exist the worker can also be deployed by hand
(`pnpm build && npx wrangler deploy`). Until a custom domain is attached it
serves on `*.workers.dev`.

### Going live on the apex

`wrangler.jsonc` ships with the `routes` block commented out (so it previews on
`workers.dev`). To serve **sneat.games**, uncomment it and attach the custom
domain once in the Cloudflare dashboard (needs a `Zone:DNS:Edit` token). Add a
zone Redirect Rule for `www → apex` rather than a second custom domain.
