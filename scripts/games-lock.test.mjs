// node --test scripts/games-lock.test.mjs   (pnpm test)
//
// The extractor is the trust boundary between a game repo's release asset
// and what this site publishes: only regular files and directories may come
// out of it. Crafted tarballs (our own writer below, so every entry type is
// exercised regardless of the local tar flavour) plus archives made by the
// system `tar` as a positive control and as real-world link cases.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { linkSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { extract, readTar, verifyTree } from "./games-lock.mjs";

/** Minimal ustar writer: entries of { name, type ('0','1','2','5',...), body?, link? }. */
function tarOf(entries) {
  const blocks = [];
  for (const e of entries) {
    const body = Buffer.from(e.body ?? "");
    const h = Buffer.alloc(512);
    h.write(e.name, 0, 100, "utf8");
    h.write("0000644\0", 100);
    h.write("0000000\0", 108);
    h.write("0000000\0", 116);
    h.write(body.length.toString(8).padStart(11, "0") + "\0", 124);
    h.write("00000000000\0", 136);
    h.write("        ", 148);
    h.write(e.type, 156);
    if (e.link) h.write(e.link, 157, 100, "utf8");
    h.write("ustar\0", 257);
    h.write("00", 263);
    let sum = 0;
    for (const b of h) sum += b;
    h.write(sum.toString(8).padStart(6, "0") + "\0 ", 148);
    blocks.push(h, body, Buffer.alloc((512 - (body.length % 512)) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks));
}

const INDEX = { name: "index.html", type: "0", body: "<!doctype html>" };

function withDist(fn) {
  const dist = mkdtempSync(join(tmpdir(), "games-lock-test-"));
  try {
    return fn(dist);
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
}

test("positive control: crafted archive with files and directories extracts", () =>
  withDist((dist) => {
    const out = extract(
      tarOf([{ name: "./", type: "5" }, INDEX, { name: "_astro/", type: "5" }, { name: "_astro/a.js", type: "0", body: "x" }]),
      "reversi",
      dist,
    );
    assert.equal(readFileSync(join(out, "_astro/a.js"), "utf8"), "x");
    assert.equal(verifyTree(out).length, 2);
  }));

test("positive control: an archive made by the system tar extracts", () =>
  withDist((dist) => {
    const src = mkdtempSync(join(tmpdir(), "games-lock-src-"));
    try {
      mkdirSync(join(src, "_astro"));
      writeFileSync(join(src, "index.html"), "<!doctype html>");
      writeFileSync(join(src, "_astro/a.css"), "body{}");
      const tgz = join(src, "..", `${src.split("/").pop()}.tgz`);
      execFileSync("tar", ["-czf", tgz, "-C", src, "."], { env: { ...process.env, COPYFILE_DISABLE: "1" } });
      const out = extract(readFileSync(tgz), "reversi", dist);
      rmSync(tgz);
      assert.equal(readFileSync(join(out, "_astro/a.css"), "utf8"), "body{}");
    } finally {
      rmSync(src, { recursive: true, force: true });
    }
  }));

for (const [what, entry] of [
  ["a symlink to a file (leak -> /etc/hosts)", { name: "leak", type: "2", link: "/etc/hosts" }],
  ["a symlink to /proc/self/environ", { name: "env", type: "2", link: "/proc/self/environ" }],
  ["a symlinked directory", { name: "etc", type: "2", link: "/etc" }],
  ["a hardlink", { name: "hard", type: "1", link: "index.html" }],
  ["a character device", { name: "dev", type: "3" }],
  ["a FIFO", { name: "fifo", type: "6" }],
]) {
  test(`refuses ${what}`, () =>
    withDist((dist) => {
      assert.throws(() => extract(tarOf([INDEX, entry]), "reversi", dist), /only regular files and directories/);
    }));
}

test("refuses a file written through a symlinked directory", () =>
  withDist((dist) => {
    assert.throws(
      () => extract(tarOf([INDEX, { name: "d", type: "2", link: "/tmp" }, { name: "d/x", type: "0", body: "x" }]), "reversi", dist),
      /only regular files and directories/,
    );
  }));

test("skips macOS AppleDouble ._ entries", () =>
  withDist((dist) => {
    const out = extract(tarOf([INDEX, { name: "._index.html", type: "0", body: "meta" }]), "reversi", dist);
    assert.equal(verifyTree(out).length, 1);
  }));

test("refuses absolute and parent-relative paths", () =>
  withDist((dist) => {
    assert.throws(() => extract(tarOf([INDEX, { name: "/etc/x", type: "0" }]), "reversi", dist), /unsafe path/);
    assert.throws(() => extract(tarOf([INDEX, { name: "a/../../x", type: "0" }]), "hex", dist), /unsafe path/);
  }));

test("refuses a pax header that sets a link target", () => {
  const rec = "linkpath=/etc/hosts\n";
  const line = `${rec.length + 3} ${rec}`; // length prefix counts itself (2 digits + space)
  assert.throws(() => readTar(gunzipSync(tarOf([{ name: "pax", type: "x", body: line }, INDEX]))), /linkpath/);
});

test("refuses links made by the system tar (symlink, hardlink, symlinked dir)", () =>
  withDist((dist) => {
    const src = mkdtempSync(join(tmpdir(), "games-lock-src-"));
    try {
      writeFileSync(join(src, "index.html"), "<!doctype html>");
      symlinkSync("/etc/hosts", join(src, "leak"));
      symlinkSync("/etc", join(src, "etcdir"));
      linkSync(join(src, "index.html"), join(src, "hard.html"));
      const tgz = `${src}.tgz`;
      execFileSync("tar", ["-czf", tgz, "-C", src, "."], { env: { ...process.env, COPYFILE_DISABLE: "1" } });
      assert.throws(() => extract(readFileSync(tgz), "reversi", dist), /only regular files and directories/);
      rmSync(tgz);
    } finally {
      rmSync(src, { recursive: true, force: true });
    }
  }));

test("refuses a bundle with a root-absolute /_astro/ reference", () =>
  withDist((dist) => {
    assert.throws(
      () => extract(tarOf([INDEX, { name: "_astro/a.js", type: "0", body: 'import("/_astro/b.js")' }]), "y", dist),
      /root-absolute/,
    );
  }));

test("refuses a corrupt header and a missing index.html", () =>
  withDist((dist) => {
    const tar = gunzipSync(tarOf([INDEX]));
    tar[0] ^= 1; // flip a bit in the first header's name
    assert.throws(() => extract(gzipSync(tar), "reversi", dist), /checksum mismatch/);
    assert.throws(() => extract(tarOf([{ name: "a.txt", type: "0", body: "x" }]), "hex", dist), /no index\.html/);
  }));

test("verifyTree refuses a symlink and a hard-linked file (lstat, not stat)", () =>
  withDist((dist) => {
    writeFileSync(join(dist, "a"), "x");
    symlinkSync("/etc/hosts", join(dist, "s"));
    assert.throws(() => verifyTree(dist), /not a regular file/);
    rmSync(join(dist, "s"));
    linkSync(join(dist, "a"), join(dist, "b"));
    assert.equal(lstatSync(join(dist, "a")).nlink, 2);
    assert.throws(() => verifyTree(dist), /nlink=2/);
  }));
