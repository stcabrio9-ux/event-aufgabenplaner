# Event-Aufgabenplaner – Frontend

React/Vite-Frontend für das Software-Engineering-Gruppenprojekt.

## Aktueller Stand

Diese Version startet **ohne Beispieldaten**.

Im Browser können aktuell angelegt bzw. geändert werden:

- Event anlegen und bearbeiten
- Aufgaben anlegen
- Aufgabenstatus ändern
- Aufgaben löschen
- Kommentare hinzufügen
- Kosten erfassen und löschen
- Mitglieder hinzufügen und löschen
- Rollen vergeben

Die Daten werden vorübergehend im `localStorage` des Browsers gespeichert. Dadurch bleiben sie nach einem Neuladen erhalten.

Sobald das Backend verfügbar ist, wird diese lokale Speicherung durch REST-API-Aufrufe ersetzt.

## Start

```bash
npm install
npm run dev
```

## Lokale Daten löschen

Unter **Events → Projektdaten zurücksetzen** können alle lokal gespeicherten Testdaten entfernt werden.

Alternativ im Browser die Local-Storage-Daten für die Seite löschen.

## Backend-Vorbereitung

Die Datei `src/services/api.js` enthält bereits eine vorbereitete API-Schicht.

`.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```
