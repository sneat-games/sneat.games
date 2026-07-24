// Edge router for the sneat.games landing — a static, multilingual site with
// no application behind it.
//
//   /en, /en/        -> 301 to /            (default locale owns the bare root)
//   /privacy, /terms -> 301 to /en/…        (unprefixed legal -> default locale)
//   everything else  -> the matching static asset (or its own 404)
//
// Because there is no root-mounted app, an asset miss simply 404s — there is no
// SPA shell to fall back to. Keep the locale list here in step with `langs` in
// src/i18n/languages.ts (this file is deliberately dependency-free).

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;

    // Default locale (en) home is the bare root, so /en and /en/ are duplicate
    // front doors: 301 them to /. Deeper /en/* pages keep their prefix.
    if (p === "/en" || p === "/en/") {
      url.pathname = "/";
      return Response.redirect(url.toString(), 301);
    }

    // Unprefixed legal pages are what people type and what others link to —
    // send them to the default locale's copy.
    const LEGAL = ["/privacy", "/terms"];
    const bare = p.length > 1 ? p.replace(/\/+$/, "") : p;
    if (LEGAL.includes(bare)) {
      url.pathname = `/en${bare}`;
      return Response.redirect(url.toString(), 301);
    }

    // Serve the matching static asset (or its own 404 — no app fallback).
    return env.ASSETS.fetch(request);
  },
};
