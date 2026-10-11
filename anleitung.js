// Bedienungsanleitung, die in der App unter „?“ erscheint.
// Jeder Abschnitt hat einen Titel und einfachen HTML-Text (<p>, <ul>, <li>, <b>).
window.SBF_ANLEITUNG = [
  {
    titel: "Worum geht es?",
    html: `<p>Mit dem SBF-Binnen Trainer lernst du alle amtlichen Prüfungsfragen für den
      Sportbootführerschein Binnen (300 Fragen aus dem ELWIS-Katalog). Die App merkt sich,
      welche Fragen du schon sicher kannst, und zeigt dir vor allem die, die noch wackeln.</p>`,
  },
  {
    titel: "Erste Schritte",
    html: `<ul>
      <li>Tippe oben auf <b>Einstellungen</b> und wähle deinen <b>Prüfungsumfang</b>,
        z. B. „Antriebsmaschine (Motor)“ oder „Antriebsmaschine + Segel“.</li>
      <li>Lege dort auch dein <b>Tagesziel</b> fest (z. B. 20 Fragen am Tag).</li>
      <li>Zurück auf der Übersicht tippst du auf <b>Lernen</b>. Es startet eine Runde mit den fälligen Fragen.</li>
      <li>Tippe die Antwort an, die du für richtig hältst. Danach siehst du, ob sie stimmt,
        und bekommst eine Erklärung. Mit <b>Weiter</b> geht es zur nächsten Frage.</li>
    </ul>`,
  },
  {
    titel: "Der Lernkasten",
    html: `<p>Jede Frage liegt in einem von fünf Fächern. Neue Fragen stehen unter „Neu“.</p>
      <ul>
        <li><b>Richtig</b> beantwortet: Die Frage rutscht ein Fach weiter.</li>
        <li><b>Falsch</b> beantwortet: Die Frage geht zurück in Fach 1.</li>
        <li>Je höher das Fach, desto seltener kommt die Frage wieder: Fach 1 sofort, Fach 2 nach 1 Tag,
          Fach 3 nach 3 Tagen, Fach 4 nach 7 Tagen, Fach 5 nach 14 Tagen.</li>
        <li>Fragen in Fach 4 und 5 gelten als <b>sicher</b>. Ziel ist, möglichst alle Fragen dorthin zu bringen.</li>
      </ul>
      <p>Tippst du auf eine Säule des Lernkastens, kannst du genau dieses Fach üben.
      Falsch beantwortete Fragen kommen am Ende der Runde noch einmal (abschaltbar).</p>`,
  },
  {
    titel: "Themen",
    html: `<p>Die Fragen sind in Themen wie „Lichter & Sichtzeichen“ oder „Schallsignale“ sortiert.
      Tippe ein Thema an, um</p>
      <ul>
        <li>nur die fälligen Fragen dieses Themas zu lernen,</li>
        <li>alle Fragen des Themas zu üben,</li>
        <li>nur die Fehler aus Fach 1 zu wiederholen oder</li>
        <li>das Thema auszublenden (z. B. „Motor & Antrieb“, wenn du nur segeln willst).</li>
      </ul>`,
  },
  {
    titel: "Prüfung simulieren",
    html: `<p>Unter <b>Prüfung simulieren</b> wählst du einen <b>Übungsbogen</b> (Bogen 1, 2, 3 …) oder einen
      zufällig zusammengestellten Bogen. Jeder Bogen hat so viele Fragen wie die echte Prüfung in deinem Umfang,
      und alle Bögen zusammen enthalten jede Frage mindestens einmal. Die Bögen bleiben immer gleich, so kannst du
      sie nacheinander „abarbeiten“. Bestandene Bögen werden grün, nicht bestandene rot markiert, mit deinem besten Ergebnis.
      Es sind <b>nicht</b> die amtlichen Prüfungsbögen; die sind nicht öffentlich.</p>
      <p>Du siehst erst am Ende, was richtig war.
      Mit <b>Zurück</b> und <b>Weiter</b> kannst du zwischen den Fragen wechseln, mit <b>Abgeben</b> wertest du aus.</p>
      <p>Die falsch beantworteten Fragen kannst du danach direkt lernen. Die Prüfung verändert den Lernkasten nicht.</p>`,
  },
  {
    titel: "Erklärungen und Stichworte",
    html: `<p>Nach jeder Antwort erklärt die App, warum die richtige Antwort stimmt, oft mit Merkhilfe.
      Darunter stehen Stichworte mit den wichtigsten Begriffen.</p>
      <p>Zu jeder Antwort gibt es außerdem einen kurzen Ton: hell bei richtig, tief bei falsch.
      Abschalten kannst du ihn in den Einstellungen unter „Töne“.</p>
      <p>In den Einstellungen unter „Nach dem Beantworten“ kannst du Erklärung und Stichworte einzeln abschalten
      oder sie nur bei falschen Antworten anzeigen lassen.
      Die Erklärungen sind selbst verfasst. Verbindlich sind die amtlichen Antworten.</p>`,
  },
  {
    titel: "Punkte, Level und das Axolotl",
    html: `<ul>
      <li><b>XP-Punkte:</b> 10 XP für jede richtige Antwort, 2 XP für jede falsche (Dranbleiben zählt!),
        50 XP Bonus für das Tagesziel, Extrapunkte für bestandene Prüfungssimulationen.</li>
      <li><b>Level:</b> Mit genug XP steigst du auf, von der Landratte über den Matrosen bis zum Seebären.</li>
      <li><b>Tagesziel und Serie:</b> Der Ring auf der Übersicht zeigt, wie viele Fragen du heute schon geschafft hast.
        Erreichst du dein Tagesziel mehrere Tage hintereinander, wächst deine 🔥-Serie.
        Lässt du einen Tag aus, beginnt sie von vorn.</li>
      <li><b>Das Axolotl:</b> Nach 10 richtigen Antworten in Folge kommt das Axolotl und lobt dich.
        Es kommt auch, wenn du dein Tagesziel erreichst oder eine Prüfung bestehst.
        Den Ton kannst du in den Einstellungen ausschalten.</li>
      <li><b>Erfolge:</b> Für besondere Leistungen gibt es Abzeichen, z. B. „7 Tage in Folge“.</li>
    </ul>`,
  },
  {
    titel: "Der Axolotl-Shop",
    html: `<p>Für deine gesammelten XP kannst du dein Axolotl verschönern: 8 Farben (z. B. Goldalbino,
      Melanoid oder leuchtend grün), 9 Kopfbedeckungen (von der Bommelmütze bis zur Krone) und Extras wie
      Fliege, Sonnenbrille oder Rettungsring.</p>
      <ul>
        <li>Den Shop öffnest du auf der Übersicht in der Punkte-Karte (🛍️ Axolotl-Shop).</li>
        <li>Tippe ein Teil an: Hast du genug XP, kannst du es kaufen. Gekaufte Teile kannst du jederzeit an- und ablegen.</li>
        <li>Dein Level sinkt durch Einkäufe <b>nicht</b>. Du gibst nur gesammelte XP aus.</li>
        <li>Das Maskottchen oben trägt immer dein aktuelles Outfit.</li>
      </ul>`,
  },
  {
    titel: "Tägliche Erinnerung",
    html: `<p>Damit du jeden Tag lernst, kann die App eine Erinnerung in deinen Kalender eintragen:</p>
      <ul>
        <li>Einstellungen → „Erinnerung“: Uhrzeit wählen und auf <b>Erinnerung im Kalender eintragen</b> tippen.</li>
        <li><b>iPhone/iPad:</b> Die Kalenderdatei öffnen und „Alle hinzufügen“ bzw. „Zum Kalender hinzufügen“ wählen.</li>
        <li><b>Android:</b> Die heruntergeladene Datei „sbf-binnen-erinnerung.ics“ antippen und mit der Kalender-App öffnen.</li>
        <li><b>Mac/PC:</b> Die Datei per Doppelklick in den Kalender (z. B. Apple Kalender oder Outlook) übernehmen.</li>
      </ul>
      <p>Der Kalender erinnert dich dann jeden Tag zur gewählten Zeit. Ändern oder löschen kannst du die Erinnerung
      direkt im Kalender. Bei installierter App zeigt das App-Symbol außerdem, wo unterstützt, die Zahl der fälligen Fragen.</p>`,
  },
  {
    titel: "App auf dem Handy installieren",
    html: `<ul>
      <li><b>iPhone/iPad (Safari):</b> Teilen-Symbol → „Zum Home-Bildschirm“.</li>
      <li><b>Android (Chrome):</b> Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.</li>
      <li><b>Mac/PC (Chrome/Edge):</b> Installieren-Symbol rechts in der Adressleiste.</li>
    </ul>
    <p>Nach dem ersten Öffnen funktioniert die App auch ohne Internet.</p>`,
  },
  {
    titel: "Lernstand sichern und übertragen",
    html: `<p>Dein Lernstand (Fächer, Punkte, Serien, Erfolge) wird nur auf diesem Gerät gespeichert.
      Unter Einstellungen → „Lernstand“ kannst du ihn als Datei <b>exportieren</b> und auf einem anderen Gerät
      <b>importieren</b>. Das ist auch eine gute Sicherung, bevor du die App löschst.</p>`,
  },
  {
    titel: "Das Maskottchen",
    html: `<p>Oben unter der Kopfzeile schwimmt dein Axolotl hin und her. Es freut sich über richtige Antworten
      und schüttelt bei falschen mitfühlend den Kopf. Tippst du es an, sagt es dir etwas Nettes.</p>
      <p>Beantwortest du <b>drei Fragen hintereinander falsch</b>, muntert es dich auf und gibt dir Tipps,
      worauf du beim Lesen achten solltest. Die Stimme (niedliches Quieken oder gesprochene Sätze) stellst du
      in den Einstellungen ein.</p>`,
  },
  {
    titel: "Bedienung mit der Tastatur (Mac/PC)",
    html: `<ul>
      <li><b>a–d</b> oder <b>1–4</b>: Antwort wählen</li>
      <li><b>Enter</b> oder <b>Leertaste</b>: weiter</li>
      <li>In der Prüfung: <b>←</b> und <b>→</b> zum Blättern</li>
      <li><b>Enter</b> oder <b>Esc</b> schließt die Axolotl-Belohnung</li>
    </ul>`,
  },
  {
    titel: "Kontakt und Haftungsausschluss",
    html: `<p>Der SBF-Binnen Trainer ist eine App von Holger. Fragen, Ideen oder Fehler gern an
      <a href="mailto:holger@wass-er.com">holger@wass-er.com</a>.</p>
      <p>Die Prüfungsfragen stammen aus dem amtlichen Katalog. Erklärungen und Stichworte sind selbst verfasst
      und nicht amtlich. Für die Richtigkeit wird keine Gewähr übernommen. Maßgeblich sind allein der amtliche
      Fragenkatalog und die geltenden Vorschriften.
      <a href="#" onclick="ueber(); return false">Vollständiger Haftungsausschluss</a></p>`,
  },
];
