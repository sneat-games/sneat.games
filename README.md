# sneat.games

Landing page for **Sneat Games** — casual games you play right inside Telegram.

Built from the Sneat landing pattern: [Astro](https://astro.build) static site,
bilingual (en + ru) on the [`@sneat/astro`](https://www.npmjs.com/package/@sneat/astro)
shared chrome, deployed to a Cloudflare Worker.

## The games

| Game | Bot | Deep link | Status |
|---|---|---|---|
| Reversi | [@SneatBot](https://t.me/SneatBot) | `t.me/SneatBot?start=reversi` | Live |
| Rock-Paper-Scissors | [@SneatBot](https://t.me/SneatBot) | `t.me/SneatBot?start=rps` | Live |
| The Greed Game | @GreedGameBot | `t.me/GreedGameBot?start=play` | Coming soon |

The `?start=<payload>` deep links rely on SneatBot routing the `/start` payload
straight into the game. The Greed Game card is marked "coming soon" until
@GreedGameBot ships — to flip it live, set its `features` item in
`src/i18n/copy/{en,ru}.ts` to `status: 'live'` with
`href: 'https://t.me/GreedGameBot?start=play'` and a `cta`.

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
  `features.items` list.
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
