# Event-Aufgabenplaner – Frontend

React/Vite-Frontend für das Software-Engineering-Gruppenprojekt.

## Aktueller Stand

Im Browser können aktuell angelegt bzw. geändert werden:

- Event anlegen und bearbeiten
- Aufgaben anlegen
- Aufgabenstatus ändern
- Aufgaben löschen
- Kommentare hinzufügen
- Kosten erfassen und löschen
- Mitglieder hinzufügen und löschen
- Rollen vergeben

Die Daten werden über die REST-API des Backends geladen und gespeichert. Das Backend verwendet PostgreSQL als primäre Datenquelle.

## Start

```bash
npm install
npm run dev
```

## Backend-Verbindung

Die Datei `src/services/api.js` enthält die API-Schicht. Für die lokale Entwicklung wird `VITE_API_URL` aus `.env` verwendet.

`.env.example`:

```env
VITE_API_URL=https://event-aufgabenplaner-production.up.railway.app/api
```
