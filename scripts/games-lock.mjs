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
//
// Extraction never shells out to `tar`: a release asset is untrusted input,
// and `tar -x` happily creates symlinks and hardlinks (e.g. `leak ->
// /proc/self/environ`, which would publish the build's GH_TOKEN at
// /<slug>/leak). The reader below accepts ONLY regular files and
// directories, writes them itself with exclusive-create, and a second lstat
// pass over the result refuses any non-regular file or nlink > 1.
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// GAMES_LOCK points at another lock file (local testing against a file://
// tarball); CI always uses the committed games.lock.json.
const LOCK = process.env.GAMES_LOCK ? resolve(process.env.GAMES_LOCK) : join(root, "games.lock.json");
const DIST = join(root, "dist");

// Landing-owned top-level paths a game slug must never shadow.
const RESERVED = new Set([
  "en", "ru", "privacy", "terms", "_astro", "favicon.svg", "robots.txt", "sw.js", "__migrate.html", "__migrate",
  "404.html", "index.html", "_redirects", "_headers", "sitemap-index.xml", "sitemap-0.xml",
]);
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const SHA_RE = /^[0-9a-f]{64}$/;
// Workers Free static assets: 20,000 files per version, 25 MiB per file.
// Guard below them so the failure is ours, with a message, not wrangler's.
const MAX_FILES = 19_000;
const MAX_FILE_BYTES = 24 * 1024 * 1024;

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";

class GamesLockError extends Error {}

function die(msg) {
  throw new GamesLockError(msg);
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

function octal(field) {
  const str = field.toString("latin1").replace(/\0.*$/s, "").trim();
  if (str === "") return 0;
  if (!/^[0-7]+$/.test(str)) die(`tar: bad numeric field ${JSON.stringify(str)}`);
  return parseInt(str, 8);
}

function cstr(field) {
  return field.toString("utf8").replace(/\0.*$/s, "");
}

function parsePax(body) {
  const out = {};
  let i = 0;
  const text = body.toString("utf8");
  while (i < text.length) {
    const sp = text.indexOf(" ", i);
    if (sp < 0) break;
    const len = parseInt(text.slice(i, sp), 10);
    if (!(len > 0)) die("tar: malformed pax header");
    const rec = text.slice(sp + 1, i + len - 1); // drop trailing \n
    const eq = rec.indexOf("=");
    if (eq > 0) out[rec.slice(0, eq)] = rec.slice(eq + 1);
    i += len;
  }
  return out;
}

/**
 * Parse an uncompressed ustar/pax/GNU tar into `{ name, kind, body }`
 * entries, kind "file" or "dir". ANY other entry type — symlink (2),
 * hardlink (1), char/block device (3/4), FIFO (6), GNU long link (K), ... —
 * is refused, as is a pax/GNU record that would set a link target.
 */
export function readTar(tar) {
  const entries = [];
  let off = 0;
  let pax = {};
  let longName = null;
  while (off + 512 <= tar.length) {
    const h = tar.subarray(off, off + 512);
    if (h.every((b) => b === 0)) return entries;
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += i >= 148 && i < 156 ? 32 : h[i];
    if (sum !== octal(h.subarray(148, 156))) die(`tar: header checksum mismatch at offset ${off}`);
    if (h[124] & 0x80) die("tar: base-256 sizes are not supported");
    const size = octal(h.subarray(124, 136));
    const type = h[156] === 0 ? "0" : String.fromCharCode(h[156]);
    let name = cstr(h.subarray(0, 100));
    const prefix = cstr(h.subarray(257, 263)).startsWith("ustar") ? cstr(h.subarray(345, 500)) : "";
    if (prefix) name = `${prefix}/${name}`;
    const start = off + 512;
    if (start + size > tar.length) die(`tar: truncated entry ${JSON.stringify(name)}`);
    const body = tar.subarray(start, start + size);
    off = start + Math.ceil(size / 512) * 512;

    if (type === "x" || type === "g") {
      const rec = parsePax(body);
      if ("linkpath" in rec) die(`tar: pax linkpath refused (${JSON.stringify(rec.linkpath)})`);
      if (type === "x") pax = rec; // global ('g') records only carry metadata we ignore
      continue;
    }
    if (type === "L") {
      longName = cstr(body);
      continue;
    }
    if (typeof pax.path === "string") name = pax.path;
    if (longName !== null) name = longName;
    pax = {};
    longName = null;

    if (type === "0" || type === "7") entries.push({ name, kind: "file", body });
    else if (type === "5") entries.push({ name, kind: "dir", body: null });
    else die(`tar: refusing entry ${JSON.stringify(name)} of type '${type}' (only regular files and directories are allowed)`);
  }
  die("tar: missing end-of-archive marker");
}

/** Normalise an entry name to path segments under the target, or throw. */
function safeSegments(name) {
  if (name.includes("\0") || name.includes("\\")) die(`unsafe path in tarball: ${JSON.stringify(name)}`);
  if (name.startsWith("/")) die(`unsafe path in tarball: ${JSON.stringify(name)}`);
  const segs = name.split("/").filter((x) => x !== "" && x !== ".");
  if (segs.includes("..")) die(`unsafe path in tarball: ${JSON.stringify(name)}`);
  return segs;
}

/**
 * Fail unless every entry under `dir` is a real directory or a regular file
 * with exactly one link. Uses lstat, so a symlink is seen as a symlink.
 */
export function verifyTree(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = lstatSync(p);
    if (st.isDirectory()) files.push(...verifyTree(p));
    else if (st.isFile() && st.nlink === 1) files.push(p);
    else die(`refusing ${p}: not a regular file or directory, or hard-linked (nlink=${st.nlink})`);
  }
  return files;
}

// A game bundle must be relative: a root-absolute /_astro/ reference in its
// JS or CSS would load the LANDING's assets (or 404) under /<slug>/.
const ROOT_ABSOLUTE_ASSET = /(["'`(]\s*)\/_astro\//;

/**
 * Extract a game's .tar.gz into `<distDir>/<slug>/`. Only regular files and
 * directories are written; nothing is written outside the target.
 */
export function extract(buf, slug, distDir = DIST) {
  let tar;
  try {
    tar = gunzipSync(buf);
  } catch (e) {
    die(`${slug}: asset is not gzip: ${e.message}`);
  }
  const entries = readTar(tar);
  if (!entries.some((e) => e.kind === "file" && safeSegments(e.name).join("/") === "index.html")) {
    die(`${slug}: tarball has no index.html`);
  }
  const out = join(distDir, slug);
  if (existsSync(out)) die(`${slug}: dist/${slug} already exists — the landing build owns that path`);
  mkdirSync(out, { recursive: true });
  for (const e of entries) {
    const segs = safeSegments(e.name);
    if (segs.length === 0) continue; // the "./" root entry
    // macOS tar stores extended attributes as AppleDouble "._<name>" files;
    // they are metadata, not part of the bundle.
    if (segs[segs.length - 1].startsWith("._")) continue;
    const dest = join(out, ...segs);
    const rel = relative(out, dest);
    if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) die(`${slug}: unsafe path in tarball: ${e.name}`);
    if (e.kind === "dir") {
      mkdirSync(dest, { recursive: true });
    } else {
      mkdirSync(dirname(dest), { recursive: true });
      // 'wx': never follow or overwrite something already there.
      writeFileSync(dest, e.body, { flag: "wx", mode: 0o644 });
      if (/\.(m?js|css)$/.test(dest) && ROOT_ABSOLUTE_ASSET.test(e.body.toString("utf8"))) {
        die(`${slug}: ${segs.join("/")} references a root-absolute /_astro/ URL — build with sneat-relativize-dist`);
      }
    }
  }
  verifyTree(out);
  return out;
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

function guardLimits() {
  // verifyTree uses lstat: a symlink anywhere in dist/ fails the build
  // instead of being followed (and its target uploaded).
  const files = verifyTree(DIST);
  if (files.length > MAX_FILES) die(`dist has ${files.length} files (> ${MAX_FILES}; Workers limit is 20,000)`);
  for (const f of files) {
    const size = lstatSync(f).size;
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

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === "install") await install();
  else if (cmd === "bump") await bump(...args);
  else die("usage: games-lock.mjs install | bump <slug> <tag>");
}

// Run only as a script, so the test file can import the helpers above.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`games-lock: ${e instanceof GamesLockError ? e.message : e.stack}`);
    process.exit(1);
  });
}
