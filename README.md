# Lukify's 🦖 Punkte

Eine kleine Belohnungs- und Punkte-App für Kinder. Lukas sammelt Sterne für erledigte Aufgaben und löst sie gegen Belohnungen ein. Die App läuft komplett im Browser, funktioniert offline und lässt sich wie eine echte App auf dem Startbildschirm installieren.

## Installation (Android-Tablet)

1. Die Adresse der Seite in **Chrome** öffnen.
2. Menü **⋮** oben rechts.
3. **„App installieren"** (bzw. „Zum Startbildschirm hinzufügen") wählen.
4. Die App öffnet sich danach im Vollbild über das Icon „Lukify" 🦖.

Querformat wird unterstützt und ist die bevorzugte Ausrichtung auf dem Tablet.

## Bedienung in Kürze

- **Start:** Aufgaben antippen, um Sterne zu sammeln. Jeder Eintrag geht zuerst zur Freigabe.
- **Shop:** Belohnungen ansehen und anfragen bzw. einlösen.
- **Verlauf:** Kalender und vollständige Historie mit Datum und Uhrzeit.
- **Freigabe:** Erwachsenen-Modus (mit 4-stelliger PIN). Hier werden Einträge bestätigt oder abgelehnt.
- **Mehr:** Aufgaben und Belohnungen bearbeiten, PIN verwalten, und Daten-Backup.

## Daten und Datenschutz

Alle Punkte, Aufgaben, Belohnungen und der Verlauf werden ausschließlich **lokal auf dem Gerät** gespeichert. Es gibt **kein Konto, keine Cloud und keinen Server**. Es werden keine persönlichen Daten übertragen.

Tipp: In **Mehr → Daten-Backup** lässt sich der komplette Stand als Datei sichern und bei Bedarf wiederherstellen, zum Beispiel als Schutz gegen Tablet-Verlust.

## Technik

Eine einzelne `index.html` (HTML, CSS, Vanilla-JavaScript, Systemschriften, keine externen Laufzeit-Abhängigkeiten). Als PWA mit Manifest und Service Worker ist sie offline nutzbar.
