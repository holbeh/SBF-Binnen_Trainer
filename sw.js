// Service Worker: speichert App, Fragen, Abbildungen, Töne und Schrift auf dem Gerät,
// damit der Trainer offline läuft.
// Strategie: App-Code (HTML, JS, CSS) zuerst aus dem Netz – Updates sind so sofort da –,
// ohne Netz aus dem Speicher. Bilder, Töne und Schrift ändern sich nie: direkt aus dem Speicher.
const CACHE = "sbf-binnen-v8";
self.window = self;
importScripts("fragen.js", "klang/texte.js"); // liefern die Listen der Bilder und Sprachaufnahmen
const BILDER = [...new Set(self.SBF_DATEN.fragen.flatMap((f) => [...f.bilder, ...f.inline]))];
const KLAENGE = Object.values(self.SBF_LOB).flat().map((s) => s.datei);
const DATEIEN = ["./", "./index.html", "./fragen.js", "./spiel.js", "./anleitung.js", "./klang/texte.js",
                 "./manifest.webmanifest", "./schrift/schrift.css",
                 "./impressum.html", "./datenschutz.html", "./rechtliches.css",
                 "./schrift/atkinson-400-latin.woff2", "./schrift/atkinson-400-latin-ext.woff2",
                 "./schrift/atkinson-700-latin.woff2", "./schrift/atkinson-700-latin-ext.woff2", ...KLAENGE.map((k) => "./" + k),
                 "./icon-180.png", "./icon-192.png", "./icon-512.png", ...BILDER.map((b) => "./" + b)];

self.addEventListener("install", (e) => {
  // "reload": an jedem Browser-Zwischenspeicher vorbei frisch laden, damit nie alte und neue Dateien gemischt werden
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN.map((u) => new Request(u, { cache: "reload" })))));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((namen) =>
    Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n)))));
  self.clients.claim();
});

const FESTE_DATEIEN = /\/(bilder|klang|schrift)\/|\.(png|gif|jpg|m4a|woff2)$/;

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  // Notausgang: Anfragen mit ?direkt=1 gehen am Service Worker vorbei direkt zum Server
  if (url.searchParams.has("direkt")) return;

  if (FESTE_DATEIEN.test(url.pathname)) {
    // Bilder, Töne, Schrift ändern sich nie: Speicher zuerst, sonst Netz
    e.respondWith(caches.open(CACHE).then(async (cache) => {
      const gespeichert = await cache.match(e.request, { ignoreSearch: true });
      if (gespeichert) return gespeichert;
      const antwort = await fetch(e.request);
      if (antwort.ok) cache.put(e.request, antwort.clone());
      return antwort;
    }));
    return;
  }

  // App-Code: Netz zuerst (Updates kommen sofort an), ohne Netz aus dem Speicher
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    try {
      const antwort = await fetch(e.request);
      if (antwort.ok && !antwort.redirected) cache.put(e.request, antwort.clone());
      return antwort;
    } catch (fehler) {
      const gespeichert = await cache.match(e.request, { ignoreSearch: true });
      if (gespeichert) return gespeichert;
      throw fehler;
    }
  }));
});
