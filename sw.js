// Service Worker: speichert App, Fragen, Abbildungen, Töne und Schrift auf dem Gerät,
// damit der Trainer offline läuft.
// Strategie: App-Code (HTML, JS, CSS) zuerst aus dem Netz – Updates sind so sofort da –,
// ohne Netz aus dem Speicher. Bilder, Töne und Schrift ändern sich nie: direkt aus dem Speicher.
const CACHE = "sbf-binnen-v6";
self.window = self;
importScripts("fragen.js", "klang/texte.js"); // liefern die Listen der Bilder und Sprachaufnahmen
const BILDER = [...new Set(self.SBF_DATEN.fragen.flatMap((f) => [...f.bilder, ...f.inline]))];
const KLAENGE = Object.values(self.SBF_LOB).flat().map((s) => s.datei);
const DATEIEN = ["./", "./index.html", "./fragen.js", "./spiel.js", "./anleitung.js", "./klang/texte.js",
                 "./manifest.webmanifest", "./schrift/schrift.css",
                 "./schrift/atkinson-400-latin.woff2", "./schrift/atkinson-400-latin-ext.woff2",
                 "./schrift/atkinson-700-latin.woff2", "./schrift/atkinson-700-latin-ext.woff2", ...KLAENGE.map((k) => "./" + k),
                 "./icon-180.png", "./icon-192.png", "./icon-512.png", ...BILDER.map((b) => "./" + b)];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((namen) =>
    Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n)))));
  self.clients.claim();
});

const FESTE_DATEIEN = /\/(bilder|klang|schrift)\/|\.(png|gif|jpg|m4a|woff2)$/;

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const gespeichert = await cache.match(e.request, { ignoreSearch: true });
    if (gespeichert && FESTE_DATEIEN.test(new URL(e.request.url).pathname)) return gespeichert;
    try {
      const antwort = await fetch(e.request, { cache: "no-cache" });
      if (antwort.ok) cache.put(e.request, antwort.clone());
      return antwort;
    } catch (fehler) {
      if (gespeichert) return gespeichert;
      throw fehler;
    }
  }));
});
