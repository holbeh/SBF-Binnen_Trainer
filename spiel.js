// Gamification: XP, Level, Tagesziel, Lernserie, Erfolge, Axolotl-Belohnung, Erinnerung.
// Wird vor dem Hauptskript in index.html geladen und greift erst zur Laufzeit auf
// dessen Zustand S, sichern(), esc(), $() usw. zu.
"use strict";

// ---------- Stellschrauben ----------
const XP = {
  richtig: 10,          // richtige Antwort (erster Versuch)
  falsch: 2,            // falsche Antwort – Dranbleiben zählt auch
  serie: 50,            // Bonus für jede 10er-Serie richtiger Antworten
  tagesziel: 50,        // Bonus, wenn das Tagesziel erreicht ist
  pruefungFrage: 3,     // je richtige Antwort in der Prüfungssimulation
  pruefungBestanden: 100,
};
const SERIE_LAENGE = 10; // nach so vielen richtigen Antworten in Folge kommt das Axolotl
const FEHLER_LAENGE = 3;  // nach so vielen falschen Antworten in Folge muntert das Axolotl auf
const LESETIPPS = [
  "Lies die Frage bis zum letzten Wort.",
  "Lies alle vier Antworten, bevor du tippst – sie unterscheiden sich oft nur in einem Detail (Zahl, Seite, Farbe).",
  "Achte auf kleine Wörter wie „nicht“, „nur“, „mindestens“ oder „alle“.",
  "Lies nach jeder Antwort die Erklärung – dann sitzt es beim nächsten Mal.",
];
// Was das Maskottchen sagt, wenn man es antippt
const MASKOTTCHEN_SPRUECHE = [
  "Blubb! Du schaffst das!",
  "Ich glaub an dich!",
  "Ahoi, Kapitän!",
  "Lies jede Frage bis zum letzten Wort!",
  "Schon gewusst? Axolotl bleiben ein Leben lang Kaulquappen-süß.",
  "Ein paar Fragen am Tag – und die Prüfung wird ein Klacks!",
  "Kiemen hoch, weiter geht's!",
];
const RAENGE = ["Landratte", "Deckschrubber", "Leichtmatrose", "Matrose", "Vollmatrose", "Bootsmann",
  "Steuermann", "Skipper", "Kapitän", "Kommodore", "Admiral", "Seebär"];

// Level n beginnt bei 50·n·(n−1) XP: Level 2 ab 100, Level 3 ab 300, Level 4 ab 600 …
const levelStart = (n) => 50 * n * (n - 1);
const levelVon = (xp) => Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2);
const rang = (n) => RAENGE[Math.min(n, RAENGE.length) - 1];

const ERFOLGE = [
  { id: "start", symbol: "⛵", name: "Leinen los", text: "Die erste Frage beantwortet", test: () => beantwortetGesamt() >= 1 },
  { id: "serie10", symbol: "🎉", name: "Axolotl-Freund", text: "10 Fragen in Folge richtig", test: () => S.besteSerie >= 10 },
  { id: "serie30", symbol: "🌟", name: "Serienstar", text: "30 Fragen in Folge richtig", test: () => S.besteSerie >= 30 },
  { id: "ziel1", symbol: "🎯", name: "Volltreffer", text: "Zum ersten Mal das Tagesziel erreicht", test: () => Object.values(S.tage).some((t) => t.ziel) },
  { id: "tage3", symbol: "🔥", name: "Dranbleiber", text: "3 Tage in Folge das Tagesziel erreicht", test: () => tagesSerie() >= 3 },
  { id: "tage7", symbol: "🧭", name: "Wochenkapitän", text: "7 Tage in Folge das Tagesziel erreicht", test: () => tagesSerie() >= 7 },
  { id: "tage30", symbol: "⚓", name: "Seebär-Ausdauer", text: "30 Tage in Folge das Tagesziel erreicht", test: () => tagesSerie() >= 30 },
  { id: "hundert", symbol: "📚", name: "Fleißig", text: "100 Fragen beantwortet", test: () => beantwortetGesamt() >= 100 },
  { id: "alle", symbol: "🗺️", name: "Weltumsegler", text: "Jede Frage im Prüfungsumfang einmal beantwortet",
    test: () => D.fragen.filter(imUmfang).every((f) => S.karten[f.nr]) },
  { id: "sicher50", symbol: "💎", name: "Sitzt!", text: "50 Fragen in Fach 5", test: () => Object.values(S.karten).filter((k) => k.f === 5).length >= 50 },
  { id: "thema", symbol: "🏅", name: "Themenmeister", text: "Ein ganzes Thema sicher (Fach 4–5)",
    test: () => themenImUmfang().some((t) => D.fragen.filter((f) => f.thema === t.id && imUmfang(f)).every((f) => fach(f.nr) >= 4)) },
  { id: "pruefung", symbol: "🏆", name: "Prüfungsreif", text: "Eine Prüfungssimulation bestanden", test: () => S.pruefungenBestanden > 0 },
];

// ---------- Tage und Serien ----------
function datum(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function heuteEintrag() {
  const k = datum();
  if (!S.tage[k]) S.tage[k] = { n: 0, r: 0, xp: 0, ziel: false };
  return S.tage[k];
}
// Tage in Folge mit erreichtem Tagesziel. Ist heute noch offen, zählt die Serie bis gestern.
function tagesSerie() {
  const d = new Date();
  d.setHours(12, 0, 0, 0); // Mittag, damit Sommer-/Winterzeit keinen Tag verschluckt
  if (!S.tage[datum(d)]?.ziel) d.setDate(d.getDate() - 1);
  let n = 0;
  while (S.tage[datum(d)]?.ziel) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const beantwortetGesamt = () => Object.values(S.tage).reduce((a, t) => a + t.n, 0);

// ---------- Punkte vergeben ----------
const warteschlange = []; // anstehende Axolotl-Belohnungen

function xpGeben(n) {
  const vorher = levelVon(S.xp);
  S.xp += n;
  heuteEintrag().xp += n;
  const nachher = levelVon(S.xp);
  if (nachher > vorher) meldung("⚓", `Level ${nachher} erreicht: ${rang(nachher)}!`);
}

function zaehlen(anzahl, richtig) {
  const t = heuteEintrag();
  t.n += anzahl;
  t.r += richtig;
  if (!t.ziel && t.n >= S.tagesziel) {
    t.ziel = true;
    xpGeben(XP.tagesziel);
    const tage = tagesSerie();
    warteschlange.push({ anlass: "tagesziel", titel: "Tagesziel geschafft!", xp: XP.tagesziel,
      zusatz: tage > 1 ? `🔥 ${tage} Tage in Folge` : "Der erste Tag deiner Serie" });
  }
}

// Nach jeder gewerteten Antwort im Lernmodus. Gibt die verdienten XP zurück.
function spielAntwort(richtig) {
  const xp = richtig ? XP.richtig : XP.falsch;
  xpGeben(xp);
  if (richtig) {
    S.serie++;
    S.besteSerie = Math.max(S.besteSerie, S.serie);
    if (S.serie % SERIE_LAENGE === 0) {
      xpGeben(XP.serie);
      warteschlange.push({ anlass: "serie", titel: `${S.serie} richtig in Folge!`, xp: XP.serie });
    }
    S.fehlerSerie = 0;
  } else {
    S.serie = 0;
    S.fehlerSerie++;
    if (S.fehlerSerie >= FEHLER_LAENGE) {
      S.fehlerSerie = 0;
      warteschlange.push({ anlass: "motivation", titel: "Kopf hoch!", stimmung: "aufmunternd",
        tipps: LESETIPPS, knopf: "Okay, ich lese genau!" });
    }
  }
  zaehlen(1, richtig ? 1 : 0);
  erfolgePruefen();
  sichern();
  return xp;
}

function spielPruefung(beantwortet, richtig, bestanden) {
  xpGeben(richtig * XP.pruefungFrage);
  if (bestanden) {
    S.pruefungenBestanden++;
    xpGeben(XP.pruefungBestanden);
    warteschlange.push({ anlass: "pruefung", titel: "Prüfung bestanden!", xp: XP.pruefungBestanden + richtig * XP.pruefungFrage });
  }
  zaehlen(beantwortet, richtig);
  erfolgePruefen();
  sichern();
}

function erfolgePruefen() {
  for (const e of ERFOLGE) {
    if (!S.erfolge[e.id] && e.test()) {
      S.erfolge[e.id] = datum();
      meldung(e.symbol, `Erfolg freigeschaltet: ${e.name}`);
    }
  }
}

// ---------- Anzeige auf der Übersicht ----------
function spielKarteHtml() {
  const t = S.tage[datum()] || { n: 0, ziel: false };
  const tage = tagesSerie();
  const lvl = levelVon(S.xp);
  const von = levelStart(lvl), bis = levelStart(lvl + 1);
  const anteil = Math.min(1, t.n / S.tagesziel);
  const umfangKreis = 2 * Math.PI * 34;
  // Wochenleiste: die letzten 7 Tage, gefüllt = Tagesziel erreicht
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - 6);
  let woche = "";
  for (let i = 0; i < 7; i++) {
    const e = S.tage[datum(d)];
    const heute = i === 6;
    woche += `<span class="wtag${e?.ziel ? " voll" : ""}${heute ? " heute" : ""}" title="${datum(d)}">
      <i></i>${"SMDMDFS"[d.getDay()]}</span>`;
    d.setDate(d.getDate() + 1);
  }
  const hinweis = t.ziel
    ? "Tagesziel erreicht ✓ – jede weitere Frage bringt trotzdem XP."
    : `Noch ${S.tagesziel - t.n} Fragen bis zum Tagesziel${tage ? ` – halte deine Serie von ${tage} Tag${tage > 1 ? "en" : ""}!` : "."}`;
  return `<div class="karte spiel">
    <div class="spiel-oben">
      <svg class="ring" viewBox="0 0 80 80" role="img" aria-label="Tagesziel ${t.n} von ${S.tagesziel}">
        <circle cx="40" cy="40" r="34" class="ring-bg"/>
        <circle cx="40" cy="40" r="34" class="ring-fg${t.ziel ? " fertig" : ""}${t.n ? "" : " leer"}" stroke-dasharray="${anteil * umfangKreis} ${umfangKreis}"/>
        <text x="40" y="38" class="ring-zahl">${t.n}</text><text x="40" y="54" class="ring-text">von ${S.tagesziel}</text>
      </svg>
      <div class="spiel-werte">
        <div class="flamme">🔥 <b>${tage}</b> ${tage === 1 ? "Tag" : "Tage"} in Folge</div>
        <div class="level">Level ${lvl} · <b>${rang(lvl)}</b></div>
        <div class="xpbalken"><i style="width:${(S.xp - von) / (bis - von) * 100}%"></i></div>
        <div class="leise klein">${S.xp} XP · noch ${bis - S.xp} bis Level ${lvl + 1}</div>
        <div class="leise klein">Serie: ${S.serie % SERIE_LAENGE} von ${SERIE_LAENGE} bis zum Axolotl</div>
      </div>
    </div>
    <div class="woche">${woche}</div>
    <p class="leise klein" style="margin:10px 0 0">${hinweis}</p>
  </div>`;
}

function erfolgeHtml() {
  const frei = ERFOLGE.filter((e) => S.erfolge[e.id]).length;
  return `<h2>Erfolge <span style="text-transform:none;letter-spacing:0">(${frei} von ${ERFOLGE.length})</span></h2>
  <div class="karte erfolge">${ERFOLGE.map((e) => `<div class="erfolg${S.erfolge[e.id] ? " frei" : ""}">
    <span class="sym">${e.symbol}</span><b>${esc(e.name)}</b><small>${esc(e.text)}</small></div>`).join("")}</div>`;
}

// ---------- Kurze Meldungen (Toast) ----------
function meldung(symbol, text) {
  let box = $("#meldungen");
  if (!box) {
    box = document.createElement("div");
    box.id = "meldungen";
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span>${symbol}</span> ${esc(text)}`;
  box.appendChild(el);
  setTimeout(() => el.classList.add("weg"), 3200);
  setTimeout(() => el.remove(), 3800);
}

// ---------- Axolotl ----------
// stimmung: "froh" (Lob) oder "aufmunternd" (mitfühlende Augenbrauen, Herz)
function axolotlSvg(stimmung = "froh") {
  const mitfuehlend = stimmung === "aufmunternd";
  return `<svg class="axolotl" viewBox="0 0 240 200" aria-hidden="true">
  <path d="M160 150 Q205 150 226 118 Q212 162 166 170 Z" fill="#f59ab9" stroke="#d9668f" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="120" cy="150" rx="54" ry="30" fill="#ffb3cc" stroke="#d9668f" stroke-width="3"/>
  <ellipse cx="88" cy="177" rx="11" ry="7" fill="#ffb3cc" stroke="#d9668f" stroke-width="3"/>
  <ellipse cx="152" cy="177" rx="11" ry="7" fill="#ffb3cc" stroke="#d9668f" stroke-width="3"/>
  <g class="kieme"><path d="M70 92 Q36 68 26 46" /><path d="M64 104 Q28 98 14 86" /><path d="M66 116 Q34 126 22 136" /></g>
  <g transform="translate(240 0) scale(-1 1)"><g class="kieme"><path d="M70 92 Q36 68 26 46" /><path d="M64 104 Q28 98 14 86" /><path d="M66 116 Q34 126 22 136" /></g></g>
  <ellipse cx="120" cy="102" rx="62" ry="48" fill="#ffc2d6" stroke="#d9668f" stroke-width="3"/>
  <ellipse cx="82" cy="118" rx="11" ry="7" fill="#ff8fb5" opacity=".75"/>
  <ellipse cx="158" cy="118" rx="11" ry="7" fill="#ff8fb5" opacity=".75"/>
  <g class="augen"><circle cx="97" cy="100" r="8.5" fill="#2b1b24"/><circle cx="143" cy="100" r="8.5" fill="#2b1b24"/>
    <circle cx="100" cy="96.5" r="3" fill="#fff"/><circle cx="146" cy="96.5" r="3" fill="#fff"/></g>
  ${mitfuehlend
    ? `<path d="M85 86 Q94 79 106 80" stroke="#2b1b24" stroke-width="3" fill="none" stroke-linecap="round"/>
       <path d="M155 86 Q146 79 134 80" stroke="#2b1b24" stroke-width="3" fill="none" stroke-linecap="round"/>
       <path d="M110 121 Q120 128 130 121" stroke="#2b1b24" stroke-width="3.5" fill="none" stroke-linecap="round"/>
       <path class="herz" d="M196 70 c-6 -10 -20 -4 -14 8 l14 12 l14 -12 c6 -12 -8 -18 -14 -8 z" fill="#e8476f"/>`
    : `<path d="M107 118 Q120 131 133 118" stroke="#2b1b24" stroke-width="3.5" fill="none" stroke-linecap="round"/>`}
  <path d="M96 62 Q120 26 144 62 Z" fill="#fff" stroke="#1b3a5c" stroke-width="3" stroke-linejoin="round"/>
  <rect x="92" y="58" width="56" height="9" rx="4" fill="#1d5a8c"/>
  <circle cx="120" cy="38" r="5" fill="#d0453b"/>
</svg>`;
}
const AXOLOTL_SVG = axolotlSvg("froh");

function belohnungenZeigen() {
  if (!warteschlange.length || $(".belohnung")) return;
  const b = warteschlange.shift();
  const sprueche = (window.SBF_LOB && window.SBF_LOB[b.anlass]) || [{ text: "Super gemacht!" }];
  const spruch = sprueche[Math.floor(Math.random() * sprueche.length)];
  const el = document.createElement("div");
  el.className = "belohnung";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", b.titel);
  el.innerHTML = `<div class="blasen">${"<i></i>".repeat(10)}</div>
    <div class="bel-karte">
      <div class="sprechblase">${esc(spruch.text)}</div>
      ${axolotlSvg(b.stimmung)}
      <div class="bel-titel">${esc(b.titel)}</div>
      ${b.tipps ? `<ul class="tipps">${b.tipps.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${b.zusatz ? `<div class="leise">${esc(b.zusatz)}</div>` : ""}
      ${b.xp ? `<div class="bel-xp">+${b.xp} XP</div>` : `<div style="height:14px"></div>`}
      <button class="knopf" onclick="belohnungZu()">${esc(b.knopf || "Danke, Axolotl!")}</button>
    </div>`;
  el.onclick = (e) => { if (e.target === el) belohnungZu(); };
  document.body.appendChild(el);
  el.querySelector("button").focus({ preventScroll: true });
  maskottchenReagieren(b.stimmung === "aufmunternd" ? "traurig" : "froh");
  lobAbspielen(spruch, b.stimmung);
}
function belohnungZu() {
  $(".belohnung")?.remove();
  setTimeout(belohnungenZeigen, 250);
}
// Enter/Escape schließt die Belohnung (Tastatur am Rechner)
document.addEventListener("keydown", (e) => {
  if ($(".belohnung") && (e.key === "Enter" || e.key === "Escape")) {
    e.preventDefault();
    e.stopImmediatePropagation();
    belohnungZu();
  }
}, true);

// ---------- Klang ----------
// Der AudioContext muss auf dem iPhone in einer Nutzergeste entstehen – deshalb
// ruft die App audioBereit() direkt beim Antippen einer Antwort auf.
let audioCtx = null;
const puffer = {};
function audioBereit() {
  if (!S.ton && !S.antwortTon) return;
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* egal */ }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!audioCtx && AC) audioCtx = new AC();
  if (!audioCtx) return;
  // auch "interrupted" (iOS nach Anruf/Hintergrund) wieder aufwecken
  if (audioCtx.state !== "running") audioCtx.resume().catch(() => {});
  // Älteres iOS: ein stummer Puffer innerhalb des Tipps gibt die Tonausgabe frei
  try {
    const stumm = audioCtx.createBufferSource();
    stumm.buffer = audioCtx.createBuffer(1, 1, 22050);
    stumm.connect(audioCtx.destination);
    stumm.start();
  } catch (e) { /* egal */ }
}
function laden(datei) {
  if (!puffer[datei]) {
    puffer[datei] = fetch(datei).then((r) => r.arrayBuffer())
      .then((b) => new Promise((ok, fehler) => audioCtx.decodeAudioData(b, ok, fehler)));
  }
  return puffer[datei];
}
function fanfare() {
  const t0 = audioCtx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((hz, i) => {
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.value = hz;
    const t = t0 + i * 0.11;
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(0.18, t + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(amp).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}
// Stimme "quieken": niedliche Axolotl-Sprache aus Silben (Standard).
// Stimme "sprache": Aufnahme der Mac-Sprachausgabe aus web/klang/.
async function lobAbspielen(spruch, stimmung = "froh") {
  if (!S.ton || !audioCtx) return;
  try {
    const froh = stimmung !== "aufmunternd";
    if (froh) fanfare();
    if (S.stimme !== "sprache" || !spruch.datei) {
      brabbeln(spruch.text, stimmung, froh ? 0.5 : 0.1);
      return;
    }
    const buf = await laden(spruch.datei);
    const quelle = audioCtx.createBufferSource();
    quelle.buffer = buf;
    quelle.playbackRate.value = 1.12; // etwas höher und flinker – klingt niedlicher
    quelle.connect(audioCtx.destination);
    quelle.start(audioCtx.currentTime + 0.5);
  } catch (e) { /* ohne Ton weiter */ }
}

// Kurzer Ton nach jeder Antwort: hell aufsteigend bei richtig, tief abfallend bei falsch.
function antwortKlang(richtig) {
  if (!S.antwortTon || !audioCtx) return;
  const t0 = audioCtx.currentTime + 0.05; // Vorlauf, falls der Kontext gerade erst aufwacht
  const ton = (hz, start, dauer, typ, pegel) => {
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    osc.type = typ;
    osc.frequency.value = hz;
    amp.gain.setValueAtTime(0.0001, t0 + start);
    amp.gain.exponentialRampToValueAtTime(pegel, t0 + start + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dauer);
    osc.connect(amp).connect(audioCtx.destination);
    osc.start(t0 + start);
    osc.stop(t0 + start + dauer + 0.02);
  };
  if (richtig) {
    ton(880, 0, 0.14, "sine", 0.45);       // A5
    ton(1318.5, 0.09, 0.28, "sine", 0.45); // E6 – zusammen ein helles „Pling“
    ton(2637, 0.09, 0.18, "sine", 0.06);   // leichter Glanz obendrauf
  } else {
    ton(330, 0, 0.18, "triangle", 0.45);    // E4
    ton(247, 0.14, 0.32, "triangle", 0.45); // H3 – sanftes, tiefes „Bonk“
  }
}

// Axolotl-Sprache: pro Vokalgruppe des Textes ein kurzes, hohes „Piep“ mit Vokalfärbung,
// fröhlich am Ende ansteigend und mit Kichern; aufmunternd tiefer, langsamer und sanfter.
const VOKALFARBE = { a: 1100, ä: 1700, e: 1900, i: 2500, o: 800, ö: 1500, u: 650, ü: 2000, y: 2200 };
function brabbeln(text, stimmung = "froh", verzoegerung = 0) {
  if (!S.ton || !audioCtx) return;
  const froh = stimmung !== "aufmunternd";
  const silben = (text.toLowerCase().match(/[aeiouäöüy]+|[.!?,]/g) || ["a"]).slice(0, 22);
  const master = audioCtx.createGain();
  master.gain.value = froh ? 0.32 : 0.26;
  master.connect(audioCtx.destination);
  const basis = froh ? 780 : 540;
  let t = audioCtx.currentTime + 0.05 + verzoegerung;
  silben.forEach((s, i) => {
    if (/[.!?,]/.test(s)) { t += s === "," ? 0.08 : 0.16; return; }
    const satzende = /[!?.]/.test(silben[i + 1] || ".");
    const dauer = (froh ? 0.075 : 0.11) + Math.random() * 0.035;
    let f = basis * (0.88 + Math.random() * 0.3);
    if (satzende) f *= froh ? 1.25 : 0.92;
    piep(master, t, dauer, f, VOKALFARBE[s[0]] || 1500, satzende && froh ? 1.35 : 1.06);
    t += dauer + (froh ? 0.03 : 0.05);
  });
  if (froh) kichern(master, t + 0.06);
}
function piep(ziel, t, dauer, f, formant, anstieg) {
  const amp = audioCtx.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(1, t + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  amp.connect(ziel);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = formant;
  filter.Q.value = 1.4;
  filter.connect(amp);
  const trocken = audioCtx.createGain();
  trocken.gain.value = 0.45;
  trocken.connect(amp);
  // Grundton (rund) + Oberton (macht es „stimmhaft“), mit kleinem Tonhöhen-Bogen wie bei „miep“
  [["sine", 1, 1], ["triangle", 2, 0.35]].forEach(([typ, mult, pegel]) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = typ;
    osc.frequency.setValueAtTime(f * mult * 0.86, t);
    osc.frequency.exponentialRampToValueAtTime(f * mult * anstieg, t + dauer * 0.55);
    osc.frequency.exponentialRampToValueAtTime(f * mult * (anstieg > 1.2 ? 1.45 : 0.97), t + dauer);
    g.gain.value = pegel;
    osc.connect(g);
    g.connect(filter);
    g.connect(trocken);
    osc.start(t);
    osc.stop(t + dauer + 0.02);
  });
}
function kichern(ziel, t) {
  [1250, 1400, 1320, 1550].forEach((f, i) => piep(ziel, t + i * 0.085, 0.055, f, 2400, 1.15));
}

// ---------- Maskottchen ----------
// Schwimmt oben unter der Kopfzeile hin und her, blinzelt und reagiert auf Antworten.
function maskottchenEinbauen() {
  if ($("#maskottchen")) return;
  const aq = document.createElement("div");
  aq.className = "aquarium";
  aq.innerHTML = `<button id="maskottchen" class="maskottchen" onclick="maskottchenTippen()" aria-label="Axolotl-Maskottchen antippen">
    <span class="richtung"><span class="wipp">${AXOLOTL_SVG}</span></span></button>`;
  document.querySelector("header").appendChild(aq);
}
function maskottchenReagieren(art) {
  const w = document.querySelector("#maskottchen .wipp");
  if (!w) return;
  w.classList.remove("froh", "traurig");
  void w.offsetWidth; // Animation neu starten
  w.classList.add(art);
  setTimeout(() => w.classList.remove(art), 1300);
}
function maskottchenTippen() {
  audioBereit();
  const spruch = MASKOTTCHEN_SPRUECHE[Math.floor(Math.random() * MASKOTTCHEN_SPRUECHE.length)];
  maskottchenReagieren("froh");
  meldung("💬", spruch);
  brabbeln(spruch, "froh");
}

// ---------- Erinnerung ----------
// Echte Push-Nachrichten bräuchten einen Server. Stattdessen trägt eine Kalenderdatei
// eine tägliche Erinnerung in den Gerätekalender ein – funktioniert offline auf allen Geräten.
function kalenderErinnerung() {
  const [h, m] = (S.erinnerung || "19:00").split(":");
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const tagStr = datum(start).replace(/-/g, "");
  const jetzt = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const url = location.href.split("#")[0];
  const zeilen = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SBF-Binnen Trainer//DE", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:sbf-binnen-taeglich@sbf-binnen-trainer",
    `DTSTAMP:${jetzt}`,
    `DTSTART:${tagStr}T${h}${m}00`,
    "DURATION:PT15M",
    "RRULE:FREQ=DAILY",
    "SUMMARY:⚓ SBF-Binnen lernen",
    `DESCRIPTION:Dein Tagesziel: ${S.tagesziel} Fragen. Halte deine Lernserie! ${url}`,
    `URL:${url}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:PT0M", "DESCRIPTION:Zeit für SBF-Binnen – dein Axolotl wartet!", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ];
  const blob = new Blob([zeilen.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sbf-binnen-erinnerung.ics";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// Zahl der fälligen Fragen als Plakette am App-Symbol (installierte App, wo unterstützt)
function plaketteSetzen(n) {
  try {
    if (!("setAppBadge" in navigator)) return;
    (n ? navigator.setAppBadge(n) : navigator.clearAppBadge()).catch(() => {});
  } catch (e) { /* nicht unterstützt */ }
}
