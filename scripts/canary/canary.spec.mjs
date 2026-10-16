// See playwright.config.mjs for how to run this and why it cannot reach
// production. SLUG picks the game (default reversi); the move/PvP checks use
// reversi's board selectors and are skipped for other games until a
// per-game selector is added below.
import { test, expect } from "@playwright/test";

const SLUG = process.env.SLUG || "reversi";
const APEX = "http://sneat.games:8841";
const OLD = `http://${SLUG}.sneat.games:8841`;
const GAME = `${APEX}/${SLUG}/`;
// The save this game kept on its old host (game-kit LEGACY_STORAGE_KEYS).
const SAVE_KEY =
  { greed: "greed-game:standings:vs-bot", "dots-and-boxes": "dnb-stats-v1", domineering: "dom-stats-v1" }[SLUG] ??
  `${SLUG}:standings:vs-bot`;
const LOCAL_HOSTS = new Set(["sneat.games:8841", `${SLUG}.sneat.games:8841`]);
const isReversi = SLUG === "reversi";
const seenExternal = [];

// Every request must stay on this machine.
test.beforeEach(async ({ context }) => {
  await context.route("**/*", async (route) => {
    const u = new URL(route.request().url());
    if (u.protocol === "data:" || u.protocol === "blob:") return route.continue();
    if (u.protocol === "http:" && LOCAL_HOSTS.has(u.host)) return route.continue();
    if (u.host === "webrtc.sneat.games") {
      const resp = await route.fetch({ url: `http://127.0.0.1:8787${u.pathname}${u.search}` });
      return route.fulfill({ response: resp });
    }
    if (u.protocol === "https:" && u.host === "sneat.games") {
      // __migrate's hand-over target: send it to the local apex (a redirect
      // without a fragment keeps the original #fragment).
      return route.fulfill({ status: 302, headers: { location: `${APEX}${u.pathname}${u.search}` } });
    }
    seenExternal.push(u.href);
    return route.abort();
  });
});

test.afterAll(() => {
  console.log(`[canary] blocked external requests: ${JSON.stringify(seenExternal)}`);
});

// game-kit reloads once when a worker takes control (clientsClaim fires
// controllerchange even on a first install), so let that settle first.
async function settleSw(page) {
  for (let i = 0; i < 40; i++) {
    try {
      await page.waitForLoadState("load");
      if (await page.evaluate(() => !!navigator.serviceWorker.controller)) break;
    } catch {
      // the page reloaded under us; try again
    }
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(1000);
  await page.waitForLoadState("load");
}

async function startClassicVsBot(page) {
  await page.locator('label[for="mode-vs-bot"]').click();
  await page.locator('label[for="variant-classic"]').click();
  await page.locator(".menu__play").click();
}

test("apex: /<slug> redirects, the game loads, plays a move, SW scope is /<slug>/, works offline", async ({ page, context }) => {
  const resp = await page.goto(`${APEX}/${SLUG}`);
  expect(page.url()).toBe(`${GAME}`);
  expect(resp.status()).toBe(200);
  await expect(page.locator(".menu__play")).toBeVisible();
  await settleSw(page);

  // CSS + JS really load (no HTML served for assets).
  const assets = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((e) => e.name).filter((n) => n.includes("/_astro/")),
  );
  expect(assets.length).toBeGreaterThan(0);
  for (const a of assets) expect(a.startsWith(`${GAME}_astro/`)).toBe(true);

  // Service worker: registered by game-kit relative to the page.
  const sw = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return { scope: reg.scope, script: (reg.active || reg.waiting || reg.installing).scriptURL };
  });
  expect(sw).toEqual({ scope: `${GAME}`, script: `${GAME}sw.js` });
  const regs = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope));
  expect(regs).toEqual([`${GAME}`]);

  // Precache holds the game's own index, never the site root.
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const urls = [];
        for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) urls.push(r.url);
        return urls;
      }),
    )
    .toContainEqual(expect.stringMatching(new RegExp(`^${GAME.replace(/[.?]/g, "\\$&")}\\?__WB_REVISION__=`)));
  const cached = await page.evaluate(async () => {
    const urls = [];
    for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) urls.push(r.url);
    return urls;
  });
  console.log(`[canary] precache: ${JSON.stringify(cached)}`);
  for (const u of cached) expect(u.startsWith(`${GAME}`)).toBe(true);

  // Play a move vs Bot.
  if (isReversi) {
  await startClassicVsBot(page);
  await expect(page.locator(".rev-cell--pick")).toHaveCount(4);
  await page.locator('[data-cell="19"]').click();
  await expect(page.locator(".rev-cell--pick").first()).toBeVisible({ timeout: 15_000 }); // bot replied
  }

  // Offline reload is answered by the game's own worker with the game.
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".menu__play")).toBeVisible();
  expect(await page.title()).toContain("Sneat Games");
  await context.setOffline(false);
});

test("apex: deep link /<slug>/some/path goes back to the game", async ({ page }) => {
  await page.goto(`${GAME}some/path?x=1#room=ABCDEF`, { waitUntil: "commit" });
  await page.waitForURL(`${GAME}?x=1#room=ABCDEF`);
  await expect(page.locator("#game")).toBeVisible();
});

test("apex: landing pages and redirects", async ({ page }) => {
  for (const [path, final] of [
    ["/", "/"],
    ["/en", "/"],
    ["/privacy", "/en/privacy/"],
    ["/ru/", "/ru/"],
  ]) {
    await page.goto(`${APEX}${path}`);
    expect(new URL(page.url()).pathname).toBe(final);
  }
  // The landing registers no service worker at the root.
  expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0);
});

test("apex: an invite link made at sneat.games keeps #room= on /<slug>/ and a guest joins", async ({ browser }) => {
  test.setTimeout(120_000);
  // With the game's service worker active on both sides; the guest is a
  // returning player (worker installed), since game-kit's first-install
  // reload mid-handshake would restart the join.
  const ctxs = [await browser.newContext(), await browser.newContext()];
  for (const c of ctxs) {
    await c.route("**/*", async (route) => {
      const u = new URL(route.request().url());
      if (u.protocol === "http:" && LOCAL_HOSTS.has(u.host)) return route.continue();
      if (u.host === "webrtc.sneat.games") {
        const resp = await route.fetch({ url: `http://127.0.0.1:8787${u.pathname}${u.search}` });
        return route.fulfill({ response: resp });
      }
      if (u.protocol === "data:" || u.protocol === "blob:") return route.continue();
      seenExternal.push(u.href);
      return route.abort();
    });
  }
  const [host, guest] = [await ctxs[0].newPage(), await ctxs[1].newPage()];
  if (process.env.DBG) for (const [n, p] of [["host", host], ["guest", guest]]) {
    p.on("console", (m) => console.log(`[${n} console] ${m.text()}`));
    p.on("response", (r) => r.url().includes("webrtc") && console.log(`[${n} resp] ${r.request().method()} ${r.url()} ${r.status()}`));
    p.on("requestfailed", (r) => console.log(`[${n} failed] ${r.request ? "" : ""}${r.method()} ${r.url()} ${r.failure()?.errorText}`));
  }

  try {
    await host.goto(`${GAME}`);
    await settleSw(host);
    await guest.goto(`${GAME}`);
    await settleSw(guest);
    await guest.goto("about:blank");
    await host.locator('label[for="mode-vs-friend"]').click();
    await host.locator('label[for="variant-classic"]').click();
    await host.locator(".menu__play").click();
    const link = host.locator("[data-invite-link]");
    await expect(link).toBeVisible({ timeout: 15_000 });
    const shareLink = (await link.innerText()).trim();
    console.log(`[canary] invite link: ${shareLink}`);
    expect(shareLink.startsWith(`${GAME}#room=`)).toBe(true);
    await guest.goto(shareLink);
    if (!isReversi) return;
    await expect(host.locator("[data-disc-score-card]")).toBeVisible({ timeout: 40_000 });
    await expect(guest.locator("[data-disc-score-card]")).toBeVisible({ timeout: 40_000 });
    for (const p of [host, guest]) {
      expect(await p.evaluate(() => navigator.serviceWorker.controller?.scriptURL)).toBe(`${GAME}sw.js`);
    }
  } finally {
    for (const c of ctxs) await c.close();
  }
});

test("old host: /sw.js kill switch + /__migrate hand saves to sneat.games/<slug>/ and leave no SW", async ({ page }) => {
  // Seed the OLD origin the way a returning player has it: saves in
  // localStorage and a root-scope worker at /sw.js. The browser's update
  // check of an old worker fetches /sw.js and gets these kill-switch bytes;
  // registering them directly exercises the same install/activate path.
  await page.goto(`${OLD}/en/privacy/`);
  await page.evaluate((key) => {
    localStorage.setItem(key, '{"wins":5,"losses":3,"draws":1}');
    localStorage.setItem("sneat-games-theme", "light");
    localStorage.setItem("unrelated", "x");
  }, SAVE_KEY);
  await page.evaluate(() => navigator.serviceWorker.register("/sw.js"));
  // activate -> clients.navigate(/__migrate) -> location.replace(apex)
  await page.waitForURL((u) => u.href.startsWith(GAME), { timeout: 20_000, waitUntil: "commit" });
  await settleSw(page);
  await expect(page.locator(".menu__play")).toBeVisible();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe("");
  const apex = await page.evaluate((key) => ({
    record: localStorage.getItem(key),
    theme: localStorage.getItem("sneat-games-theme"),
    unrelated: localStorage.getItem("unrelated"),
    attr: document.documentElement.getAttribute("data-theme"),
  }), SAVE_KEY);
  expect(apex).toEqual({ record: '{"wins":5,"losses":3,"draws":1}', theme: "light", unrelated: null, attr: "light" });

  await page.goto(`${OLD}/robots.txt`);
  const old = await page.evaluate(async () => ({
    regs: (await navigator.serviceWorker.getRegistrations()).length,
    caches: (await caches.keys()).length,
  }));
  expect(old).toEqual({ regs: 0, caches: 0 });
});

test("old host: /__migrate keeps an invite's #room= and adds nothing when there are no saves", async ({ page }) => {
  await page.goto(`${OLD}/__migrate.html#room=ABCDEF`);
  await page.waitForURL(`${GAME}#room=ABCDEF`, { timeout: 20_000, waitUntil: "commit" });
});
