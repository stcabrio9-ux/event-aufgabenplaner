# Event-Aufgabenplaner Backend

Express-/PostgreSQL-API für den Event-Aufgabenplaner. Die API verwendet ES-Module und liefert die JSON-Feldnamen des bestehenden React-Frontends (`name`, `date`, `participants`, `dueDate`, `projectRole`, `accessRole` usw.).

## Lokal einrichten

Voraussetzungen: Node.js 20 oder neuer und eine laufende PostgreSQL-Datenbank.

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

`DATABASE_URL` in `.env` auf die lokale Datenbank setzen. Es werden keine Zugangsdaten ins Repository eingecheckt.

## Migration und Start

```powershell
npm run migrate
npm run dev
```

Für einen normalen Start: `npm start`. Die API läuft standardmäßig auf `http://localhost:3000`.

## Endpunkte

- `GET /api/health`
- `GET|POST /api/events`
- `GET|PATCH|DELETE /api/events/:id`
- `GET|POST /api/events/:eventId/tasks`
- `PATCH|DELETE /api/tasks/:id`
- `GET|POST /api/events/:eventId/members`
- `DELETE /api/members/:id`
- `GET|POST /api/events/:eventId/costs`
- `DELETE /api/costs/:id`
- `GET|POST /api/events/:eventId/comments`

Statuswerte sind `Offen`, `In Bearbeitung` und `Erledigt`; Prioritäten `Niedrig`, `Mittel` und `Hoch`; Zugriffsrollen `Betrachter`, `Bearbeiter` und `Administrator`.

## Railway

Ein Railway-PostgreSQL-Service stellt `DATABASE_URL` bereit. Diese Variable zusammen mit `NODE_ENV=production`, `PORT` (falls Railway ihn vorgibt) und `FRONTEND_URL` im Backend-Service konfigurieren. Anschließend im Deploy- oder Release-Schritt `npm run migrate` ausführen und als Startkommando `npm start` verwenden. In Produktion aktiviert der Pool TLS für PostgreSQL.

## Tests

```powershell
npm test
```

Die Tests prüfen Health-Endpunkt, Zod-Validierung und zentrale 404-Fehlerbehandlung und benötigen keine Datenbankverbindung.
