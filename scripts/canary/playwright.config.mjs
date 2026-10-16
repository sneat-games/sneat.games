// Local canary browser check for a game served under sneat.games/<slug>/.
// NOT run in CI and never pointed at production. Recipe (README "Games"):
//
//   GAMES_LOCK=<local lock with a file:// url> pnpm build
//   npx wrangler dev --local --port 8841 --ip 127.0.0.1
//   GAME_KIT_DIR=<path to a built @sneat/game-kit> pnpm test:canary
//
// sneat.games and *.sneat.games RESOLVE TO 127.0.0.1 in this browser
// (host-resolver-rules), so nothing can reach production. The spec routes
// the relay (https://webrtc.sneat.games) to game-kit's local test relay on
// 8787 and https://sneat.games/* to the local apex, and aborts anything else
// off-machine (logged as "blocked external requests"). Do not add tests that
// use Playwright's Node-side `request` fixture: it resolves real DNS.
import { defineConfig } from "@playwright/test";

const PORT = 8841;
const SLUG = process.env.SLUG || "reversi";
const origins = ["sneat.games", `${SLUG}.sneat.games`].map((h) => `http://${h}:${PORT}`).join(",");
const kit = process.env.GAME_KIT_DIR || "../game-kit";

export default defineConfig({
  testDir: ".",
  testMatch: /canary\.spec\.mjs/,
  timeout: 120_000,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    // Full Chromium: the headless shell ignores the secure-origin flag, so
    // service workers would not exist on http://sneat.games:8841.
    channel: "chromium",
    launchOptions: {
      args: [
        "--host-resolver-rules=MAP sneat.games 127.0.0.1, MAP *.sneat.games 127.0.0.1",
        `--unsafely-treat-insecure-origin-as-secure=${origins}`,
        // Host candidates as plain IPs: mDNS .local names do not resolve
        // under host-resolver-rules, and WebRTC never connects.
        "--disable-features=WebRtcHideLocalIpsWithMdns",
      ],
    },
  },
  webServer: {
    command: `node ${kit}/dist/test-relay.mjs 8787`,
    port: 8787,
    reuseExistingServer: false,
  },
});
