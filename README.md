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

## Games under `/<slug>/`

The browser games are served from this site, at `https://sneat.games/<slug>/`,
by the same **assets-only** Worker. It has no `main`, so no Worker code runs on any request.
The slug is the old host label: `reversi`, `greed`, `y`,
`bidding-tictactoe`, and so on.

- **Source of truth: `games.lock.json`.** It maps each slug to a game
  repo's GitHub release (`version` = tag `web-<sha12>`), the asset (a
  tarball of the game's built `dist/`), its `url` and its `sha256`.
- **Build:** `pnpm build` runs `astro build`, then
  `node scripts/games-lock.mjs install`. That step:
  - downloads each asset and **fails on a sha256 mismatch**
  - extracts it into `dist/<slug>/`
  - writes `dist/<slug>/404.html`, which sends deep links back to `/<slug>/`
  - fails if the deploy would exceed the Workers file-count or file-size limits
- **Ship a new game build:** the game repo's CI publishes `web-<sha12>`
  on push to main. Then run
  `GH_TOKEN=$(gh auth token) pnpm games:bump <slug> web-<sha12>`. For a slug
  that is not in the lock yet, prefix it with `GAME_REPO=sneat-games/<repo>`.
  Open a PR. Merging it deploys.
- **Tokens:**
  - CI downloads with the deploy job's own token (`build-github-auth: true` in
    `deploy.yml`). That is enough for public game repos.
  - The 7 private game repos need cf-deploy's repository-scoped GitHub App token
    instead (`build-github-app-*` inputs plus `BUILD_GITHUB_APP_PRIVATE_KEY`,
    the same path as datatug-apps). The App must be installed on the
    sneat-games org with read access to those repos.
- **Routing:** there is no splat rewrite for a game directory. It would serve
  `index.html` for real JS and CSS files. Deep links rely on
  `not_found_handling: "404-page"` and the generated `404.html`. A request for
  `/<slug>` gets a 307 to `/<slug>/` from the default `html_handling`.
- **Retired subdomains:**
  - `public/sw.js` is a kill switch for the old hosts' service workers.
  - `public/__migrate.html`, served at `/__migrate`, hands their saves
    (localStorage keys) to `/<slug>/#migrate=...`. game-kit's
    `consumeMigratedStorage()` imports them.
  - Both only matter once the old hosts are attached here as custom domains.
    `docs/cloudflare-cutover.md` has the exact Cloudflare API calls, run by
    hand at canary time.
- **Local check:** `GAMES_LOCK=<lock with a file:// url> pnpm build`, then
  `npx wrangler dev --local --port 8841`, then `pnpm test:canary` (see
  `scripts/canary/playwright.config.mjs`). This never reaches production.

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
(and keep the locale redirects in `public/_redirects` in step).

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
