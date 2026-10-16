// Kill switch for the service workers of the retired <game>.sneat.games hosts.
//
// Until 2026-10 every game ran on its own subdomain and registered a
// precaching worker at `/sw.js` with scope `/`. That worker answers
// navigations from its precache BEFORE the network, so a returning player
// never sees the zone redirect to https://sneat.games/<slug>/ and would stay
// on the frozen old build forever. Those hosts are now custom domains of
// this assets-only Worker, and the zone redirect passes `/sw.js` and
// `/__migrate.html` through (docs/cloudflare-cutover.md). The browser's own
// update check therefore fetches THIS file, sees new bytes, and installs it:
//
//   install  -> skipWaiting (take over at once, no waiting tab dance)
//   activate -> delete every cache, claim the open tabs, and send each to
//               /__migrate.html, which copies the saves to sneat.games,
//               unregisters this worker and leaves for the new home
//   fetch    -> any navigation goes to /__migrate.html (this also catches
//               the reload game-kit's controllerchange listener triggers);
//               everything else passes through to the network
//
// Never registered by anything on the apex itself: games register their own
// `/<slug>/sw.js` (scope `/<slug>/`). If it ever is, it removes itself.

// The page is public/__migrate.html; the default html_handling serves it at
// /__migrate (a request for /__migrate.html gets a 307 there), so go
// straight to the canonical path. The zone rule passes both through.
const MIGRATE_PATH = "/__migrate";
const isApex = self.location.hostname === "sneat.games";

function migrateUrl(fromUrl) {
  const u = new URL(MIGRATE_PATH, self.location.origin);
  // Keep `#room=...` from an invite the player opened on the old host.
  if (fromUrl) u.hash = new URL(fromUrl).hash;
  return u.href;
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const activated = (async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    if (isApex) {
      await self.registration.unregister();
      return false;
    }
    await self.clients.claim();
    return true;
  })();
  event.waitUntil(activated);
  // Navigate the tabs AFTER activation, never inside waitUntil: a client
  // navigation fires a fetch event, fetch events wait until this worker is
  // activated, and activation would wait for the navigation — a deadlock
  // (seen in the canary browser check: the tab hung forever).
  activated.then(async (proceed) => {
    if (!proceed) return;
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).pathname.startsWith(MIGRATE_PATH)) continue;
      // Refused for a client this worker does not control; that tab's next
      // navigation still reaches the fetch handler below.
      client.navigate(migrateUrl(client.url)).catch(() => {});
    }
  });
});

self.addEventListener("fetch", (event) => {
  if (isApex || event.request.mode !== "navigate") return;
  const path = new URL(event.request.url).pathname;
  if (path === MIGRATE_PATH || path === `${MIGRATE_PATH}.html`) return;
  // A redirect without a fragment keeps the original one (`#room=`).
  event.respondWith(Response.redirect(new URL(MIGRATE_PATH, self.location.origin).href, 302));
});
