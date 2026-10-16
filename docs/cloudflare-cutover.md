# Cloudflare cutover: retiring `<game>.sneat.games` (canary: reversi)

Nothing in this file runs on merge. Merging this repo only deploys the
assets-only `sneat-games` Worker on `sneat.games` (see
`.github/workflows/deploy.yml`). The steps below are run by hand by the
zone owner at canary time, **after** reversi's `web-<sha>` release is pinned
in `games.lock.json` and deployed, so `https://sneat.games/reversi/` already
serves the game.

Not executed yet: every call below is written from the Cloudflare API
reference and has not been run. Steps 2 and 3 need a token with
`Workers Scripts:Edit` and `Zone:DNS:Edit`, plus `Zone:Single Redirect Rules:Edit`
(called "Dynamic URL Redirects" in older token UIs) on the sneat.games zone.

```sh
export CF_ACCOUNT_ID=...            # the CLOUDFLARE_ACCOUNT_ID org variable
export CF_ZONE_ID=...               # sneat.games zone (sneat-ops data/domains.json: 678cb49d…)
export CF_API_TOKEN=...             # never commit it
api() { curl -sS -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" "$@"; }
HOST=reversi.sneat.games            # canary; later the other 9, one per run
```

## 1. Preflight

```sh
# Existing Single Redirect rules on the zone (Free plan: 10 max; we add 1).
api "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/rulesets/phases/http_request_dynamic_redirect/entrypoint" | jq '.result.rules'
# Which Worker holds the hostname now (expect service "reversi-game").
api "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/domains?hostname=$HOST" | jq '.result'
```

A 404 from the first call means the zone has no redirect entrypoint yet:
use the `PUT` in step 3 (it creates it).

## 2. Move the custom domain to `sneat-games`

So the old host serves `/sw.js` (the kill switch) and `/__migrate` from this
repo's assets. There is no "move" call: detach, then attach. Expect about a
minute of errors on `$HOST` in between; do it right before step 3.

```sh
DOMAIN_ID=$(api "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/domains?hostname=$HOST" | jq -r '.result[0].id')
api -X DELETE "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/domains/$DOMAIN_ID"
api -X PUT "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/domains" \
  --data "{\"hostname\":\"$HOST\",\"service\":\"sneat-games\",\"zone_id\":\"$CF_ZONE_ID\",\"environment\":\"production\"}"
```

Then add the same hostname to `routes` in `wrangler.jsonc`
(`{ "pattern": "reversi.sneat.games", "custom_domain": true }`) in a PR, so the
config matches what is live and the next deploy keeps it.

After the domains of all 10 games have moved, delete the old Workers (one Worker slot each):

```sh
api -X DELETE "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/scripts/reversi-game"
```

## 3. The one zone Single Redirect rule

It sends every path on the listed hosts to `https://sneat.games/<label>/<path>`,
except `/sw.js` and the migration page. The migration page is served at
`/__migrate`: the default `html_handling` answers `/__migrate.html` with a
307 to it, so both paths pass through. Hosts are listed by name, so
`webrtc.sneat.games` and `signal.bidding-tictactoe.sneat.games` are never
matched, and a future subdomain is never captured by accident. Slug = old
host label (`greed`, `y`), which is why one rule covers every game.

The pattern starts with `*://` so `http://` requests match too. With
`https://*.sneat.games/*`, an http request would not match, and
`wildcard_replace` would return the URL unchanged: a redirect to itself.
Turn off "preserve query string", because `full_uri` already carries the query.
Browsers keep the `#fragment` (`#room=`) across the redirect.

Start at 302. Switch to 301 after about a week of clean metrics.

Canary rule body (reversi only):

```json
{
  "description": "Retired game hosts -> https://sneat.games/<label>/ (keeps /sw.js and /__migrate for the hand-over)",
  "expression": "(http.host in {\"reversi.sneat.games\"} and not http.request.uri.path in {\"/sw.js\" \"/__migrate\" \"/__migrate.html\"})",
  "action": "redirect",
  "action_parameters": {
    "from_value": {
      "status_code": 302,
      "target_url": {
        "expression": "wildcard_replace(http.request.full_uri, \"*://*.sneat.games/*\", \"https://sneat.games/${2}/${3}\")"
      },
      "preserve_query_string": false
    }
  },
  "enabled": true
}
```

If step 1 showed **no** entrypoint ruleset, create it with this one rule:

```sh
api -X PUT "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/rulesets/phases/http_request_dynamic_redirect/entrypoint" \
  --data "{\"rules\":[$(cat rule.json)]}"
```

If it **exists**, add the rule without touching the others:

```sh
RULESET_ID=$(api "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/rulesets/phases/http_request_dynamic_redirect/entrypoint" | jq -r '.result.id')
api -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/rulesets/$RULESET_ID/rules" --data @rule.json
```

To roll out the other 9, edit that rule (`PATCH .../rules/$RULE_ID`) and grow the host set to:

```
{"bidding-tictactoe.sneat.games" "dots-and-boxes.sneat.games" "domineering.sneat.games"
 "four-in-a-row.sneat.games" "gomoku.sneat.games" "greed.sneat.games" "hex.sneat.games"
 "reversi.sneat.games" "ultimate-tictactoe.sneat.games" "y.sneat.games"}
```

## 4. Canary checks (production, after steps 2 and 3)

```sh
curl -sI "https://$HOST/" | grep -i '^location'            # https://sneat.games/reversi/
curl -sI "https://$HOST/x/y?z=1" | grep -i '^location'     # https://sneat.games/reversi/x/y?z=1
curl -sI "https://$HOST/sw.js" | head -1                   # 200, the kill switch
curl -sI "https://$HOST/__migrate" | head -1               # 200
curl -sI "https://webrtc.sneat.games/" | grep -ic location  # 0: the relay is untouched
```

In a browser profile that played on the old host (with a service worker and a
`reversi:standings:vs-bot` record), open `https://reversi.sneat.games/#room=abc`.
It should land on `https://sneat.games/reversi/#room=abc` with the record
imported, and `navigator.serviceWorker.getRegistrations()` on the old host
should return an empty list. Workers analytics should show 0 invocations
for `sneat-games`.

The same flow was verified locally against `wrangler dev`; see
`scripts/canary/`.

## Rollback

- Disable the rule (`PATCH` it with `"enabled": false`).
- Move the custom domain back to `reversi-game` (step 2 in reverse). Its
  Worker still holds the last host build until it is deleted.
