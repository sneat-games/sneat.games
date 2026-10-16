#!/usr/bin/env node
// Games served under https://sneat.games/<slug>/, from pinned release assets.
//
//   node scripts/games-lock.mjs install            (part of `pnpm build`)
//   node scripts/games-lock.mjs bump <slug> <tag>  (update one pin)
//
// games.lock.json maps each slug to the GitHub release asset holding the
// game's built web bundle (a .tar.gz of its dist/), and the asset's sha256:
//
//   "reversi": { "repo": "sneat-games/reversi", "version": "web-<sha12>",
//                "asset": "reversi-web-<sha12>.tar.gz", "url": "...", "sha256": "..." }
//
// `install` runs after `astro build`: it downloads every asset, REFUSES any
// whose sha256 differs from the lock, extracts it into dist/<slug>/, writes
// dist/<slug>/404.html (sends deep links back to /<slug>/, see below), and
// fails if the deploy would exceed the Workers static-asset limits.
//
// Downloads: `url` is fetched directly when it is file:, http(s)://localhost
// or 127.0.0.1 (local testing), or when no token is set (public repos).
// With GH_TOKEN/GITHUB_TOKEN set, the asset is resolved through the GitHub
// API (releases/tags/<version> -> assets/<id>, octet-stream), which is what
// a PRIVATE game repo needs. In CI, cf-deploy provides GH_TOKEN: the job's
// own token (`build-github-auth: true`, enough for public repos) or a
// repository-scoped GitHub App token (`build-github-app-*` inputs, needed
// once a private game is pinned) — see README "Games".
//
// Why a generated 404.html and not a `/<slug>/* /<slug>/index.html 200`
// rewrite: Workers redirects are followed "regardless of whether or not an
// asset matches", so that rule would serve index.html for real JS/CSS files.
// With `not_found_handling: "404-page"` the nearest 404.html answers misses
// only, and the games route by `#fragment`, so the page simply goes home.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// GAMES_LOCK points at another lock file (local testing against a file://
// tarball); CI always uses the committed games.lock.json.
const LOCK = process.env.GAMES_LOCK ? resolve(process.env.GAMES_LOCK) : join(root, "games.lock.json");
const DIST = join(root, "dist");

// Landing-owned top-level paths a game slug must never shadow.
const RESERVED = new Set(["en", "ru", "_astro", "favicon.svg", "robots.txt", "sw.js", "__migrate.html", "__migrate", "404.html", "index.html"]);
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const SHA_RE = /^[0-9a-f]{64}$/;
// Workers Free static assets: 20,000 files per version, 25 MiB per file.
// Guard below them so the failure is ours, with a message, not wrangler's.
const MAX_FILES = 19_000;
const MAX_FILE_BYTES = 24 * 1024 * 1024;

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";

function die(msg) {
  console.error(`games-lock: ${msg}`);
  process.exit(1);
}

function readLock() {
  const lock = JSON.parse(readFileSync(LOCK, "utf8"));
  if (!lock || typeof lock.games !== "object") die("games.lock.json: missing `games` object");
  for (const [slug, g] of Object.entries(lock.games)) {
    if (!SLUG_RE.test(slug) || RESERVED.has(slug)) die(`invalid or reserved slug ${JSON.stringify(slug)}`);
    for (const f of ["repo", "version", "asset", "url", "sha256"]) {
      if (typeof g[f] !== "string" || !g[f]) die(`${slug}: missing ${f}`);
    }
    if (!SHA_RE.test(g.sha256)) die(`${slug}: sha256 must be 64 lowercase hex chars`);
  }
  return lock;
}

function isLocalUrl(url) {
  if (url.startsWith("file:")) return true;
  const { hostname } = new URL(url);
  return hostname === "localhost" || hostname === "127.0.0.1";
}

async function getJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
  });
  if (!res.ok) die(`GET ${url}: ${res.status} ${res.statusText}`);
  return res.json();
}

async function download(g) {
  if (g.url.startsWith("file:")) return readFileSync(fileURLToPath(g.url));
  let url = g.url;
  const headers = {};
  if (token && !isLocalUrl(url)) {
    const rel = await getJson(`https://api.github.com/repos/${g.repo}/releases/tags/${encodeURIComponent(g.version)}`);
    const asset = (rel.assets ?? []).find((a) => a.name === g.asset);
    if (!asset) die(`${g.repo}@${g.version}: no asset named ${g.asset}`);
    url = asset.url;
    headers.Accept = "application/octet-stream";
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) die(`download ${g.url}: ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

function extract(buf, slug) {
  const tmp = mkdtempSync(join(tmpdir(), `games-lock-${slug}-`));
  try {
    const tgz = join(tmp, "asset.tar.gz");
    writeFileSync(tgz, buf);
    // Refuse anything that could land outside dist/<slug>/.
    const entries = execFileSync("tar", ["-tzf", tgz], { encoding: "utf8" }).split("\n").filter(Boolean);
    for (const e of entries) {
      if (e.startsWith("/") || e.split("/").includes("..")) die(`${slug}: unsafe path in tarball: ${e}`);
    }
    if (!entries.some((e) => e.replace(/^\.\//, "") === "index.html")) die(`${slug}: tarball has no index.html`);
    const out = join(DIST, slug);
    if (existsSync(out)) die(`${slug}: dist/${slug} already exists — the landing build owns that path`);
    mkdirSync(out, { recursive: true });
    execFileSync("tar", ["-xzf", tgz, "-C", out, "--no-same-owner"]);
    return out;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function notFoundPage(slug) {
  const home = `/${slug}/`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<title>Sneat Games</title>
<script>location.replace(${JSON.stringify(home)} + location.search + location.hash);</script>
</head><body><p><a href="${home}">Continue to the game</a></p></body></html>
`;
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function guardLimits() {
  const files = walk(DIST);
  if (files.length > MAX_FILES) die(`dist has ${files.length} files (> ${MAX_FILES}; Workers limit is 20,000)`);
  for (const f of files) {
    const size = statSync(f).size;
    if (size > MAX_FILE_BYTES) die(`${relative(DIST, f)} is ${size} bytes (> 24 MiB; Workers limit is 25 MiB)`);
  }
  console.log(`games-lock: dist has ${files.length} files, all under 24 MiB`);
}

async function install() {
  if (!existsSync(join(DIST, "index.html"))) die("dist/index.html missing — run `astro build` first");
  const { games } = readLock();
  for (const [slug, g] of Object.entries(games)) {
    const buf = await download(g);
    const got = sha256(buf);
    if (got !== g.sha256) die(`${slug}: sha256 mismatch for ${g.asset}: lock ${g.sha256}, got ${got}`);
    const out = extract(buf, slug);
    writeFileSync(join(out, "404.html"), notFoundPage(slug));
    console.log(`games-lock: ${slug} ${g.version} (${g.repo}) -> dist/${slug}/ sha256 ok`);
  }
  guardLimits();
}

async function bump(slug, version) {
  if (!slug || !version) die("usage: games-lock.mjs bump <slug> <tag>");
  const lock = existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, "utf8")) : { games: {} };
  const prev = lock.games[slug];
  const repo = prev?.repo ?? process.env.GAME_REPO;
  if (!repo) die(`${slug} is not in the lock yet: set GAME_REPO=<owner/repo>`);
  if (!token) die("bump needs GH_TOKEN (e.g. GH_TOKEN=$(gh auth token))");
  const rel = await getJson(`https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(version)}`);
  const asset = (rel.assets ?? []).find((a) => a.name.endsWith(".tar.gz"));
  if (!asset) die(`${repo}@${version}: no .tar.gz asset`);
  const g = { repo, version, asset: asset.name, url: asset.browser_download_url, sha256: "" };
  const buf = await download(g);
  g.sha256 = sha256(buf);
  // Cross-check the release's own .sha256 file when it publishes one.
  const sumAsset = (rel.assets ?? []).find((a) => a.name === `${asset.name}.sha256`);
  if (sumAsset) {
    const res = await fetch(sumAsset.url, { headers: { Accept: "application/octet-stream", Authorization: `Bearer ${token}` } });
    const published = (await res.text()).trim().split(/\s+/)[0];
    if (published !== g.sha256) die(`${asset.name}: published sha256 ${published} != downloaded ${g.sha256}`);
  }
  lock.games[slug] = g;
  writeFileSync(LOCK, JSON.stringify(lock, null, 2) + "\n");
  console.log(`games-lock: ${slug} -> ${version} (${g.sha256})`);
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === "install") await install();
else if (cmd === "bump") await bump(...args);
else die("usage: games-lock.mjs install | bump <slug> <tag>");
