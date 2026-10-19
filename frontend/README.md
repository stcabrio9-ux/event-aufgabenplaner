# Event-Aufgabenplaner – Frontend V3

React/Vite-Frontend für das Software-Engineering-Gruppenprojekt.

## V3 – aktueller Funktionsstand

### Öffentlicher Bereich
- Startseite/Dashboard ohne Login erreichbar
- öffentliche Eventübersicht
- öffentliche Eventdetailseite mit Bild, Beschreibung, Zeitraum, Ort und Beteiligten
- Login/Registrierung erst für persönliche und verwaltende Funktionen notwendig

### Eventverwaltung
- Events mit Bild, Beschreibung, Zeitraum, Uhrzeiten, Ort, Teams und Einzelpersonen
- Eventerstellung nur mit Benutzerkonto
- Eventdaten und Eventzuweisungen dürfen nur vom Ersteller geändert werden
- Event-Management nur für Ersteller oder zugewiesene Mitglieder

### Event-Management
- Fortschrittsübersicht mit Prozentwert und Statusaufteilung
- Aufgabenübersicht inklusive verantwortlicher Person
- Aufgaben anlegen, bearbeiten und löschen
- Aufgaben erhalten eindeutige Ticketnummern
- Kosten anlegen, bearbeiten und löschen
- Kosten können mit einer Aufgabe verknüpft werden
- verknüpfte Kosten werden zusätzlich in der Aufgabendetailansicht angezeigt
- Kommentare, Erwähnungen und vorbereitete E-Mail-Kommunikation pro Aufgabe

### Teams & Personen
- eigener Hauptbereich `Teams & Personen`
- Teams sind nicht mehr unter `Meine Events` eingebettet
- Teams anlegen und bearbeiten
- externe Personen anlegen, bearbeiten und löschen
- Account-Nutzer werden automatisch als Personen geführt
- mehrere Teams und einzelne Personen können Events zugeordnet werden
- Aufgaben können nur Personen zugewiesen werden, die zum Event gehören

### Persönlicher Bereich
- Meine Events
- Meine Aufgaben
- Benachrichtigungseinstellungen

## Lokaler Start

```bash
npm install
npm run dev
```

Danach die von Vite ausgegebene lokale Adresse öffnen, normalerweise:

```text
http://localhost:5173/
```

## Speicherung im Prototyp

Die Frontend-Demo verwendet aktuell `localStorage`. Das dient nur zum unabhängigen Entwickeln und Testen des Frontends. Sobald die REST-API des Backends steht, wird diese lokale Speicherung schrittweise durch echte API-Aufrufe ersetzt.

## Wichtiger Hinweis zu Berechtigungen

Die V3 bildet Zugriffsregeln bereits im Frontend ab. Für den Produktivbetrieb müssen diese Regeln zusätzlich serverseitig im Backend geprüft werden. Frontend-Prüfungen allein sind keine Sicherheitsgrenze.


## V4-Ergänzungen

- Persönliche Dashboard-Übersicht für angemeldete Nutzer
- Eigene und zugewiesene Events auf der Startseite
- Aufgabenstatus als Donut-Übersicht und persönliche Aufgabenliste
- Neueste Zuweisungen, Kommentare und @-Erwähnungen auf dem Dashboard
- Kommentare an zugewiesenen Aufgaben erzeugen eine Benachrichtigung
- @-Mention-Autocomplete direkt im Kommentarfeld
- Verknüpfte Kosten werden in Aufgabenlisten und Aufgabendetails angezeigt
