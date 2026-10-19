import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";
import { hashPassword, verifyPassword } from "../src/services/auth.js";
import { createToken } from "../src/services/auth.js";
import { config } from "../src/config.js";

config.authSecret = "test-only-auth-secret";
const userToken = () => createToken({ id: "00000000-0000-0000-0000-000000000001", email: "user@example.com", name: "Testnutzer", role: "user" });
const adminToken = () => createToken({ id: "00000000-0000-0000-0000-000000000002", email: "admin@example.com", name: "Administrator", role: "admin" });

test("Passwörter werden gehasht und nur mit dem richtigen Passwort verifiziert", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.notEqual(hash, "correct horse battery staple");
  assert.equal(await verifyPassword("correct horse battery staple", hash), true);
  assert.equal(await verifyPassword("wrong password", hash), false);
});

test("Login validiert fehlende Zugangsdaten ohne Datenbankzugriff", async () => {
  const response = await request(app).post("/api/auth/login").send({ email: "not-an-email" });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});

test("Fach-API verlangt Anmeldung", async () => {
  const response = await request(app).get("/api/events");
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "UNAUTHORIZED");
});

test("/api/auth/me liefert die Rolle des angemeldeten Benutzers", async () => {
  const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${userToken()}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.user.role, "user");
});

test("Normale Benutzer dürfen keine Events erstellen oder Mitglieder verwalten", async () => {
  const event = await request(app).post("/api/events").set("Authorization", `Bearer ${userToken()}`).send({ name: "Test", date: "2026-01-01" });
  assert.equal(event.status, 403);
  const member = await request(app).post("/api/events/00000000-0000-0000-0000-000000000001/members").set("Authorization", `Bearer ${userToken()}`).send({ name: "Person" });
  assert.equal(member.status, 403);
});

test("Normale Benutzer und Administratoren erreichen die erlaubte Aufgabenaktion", async () => {
  const user = await request(app).post("/api/events/not-a-uuid/tasks").set("Authorization", `Bearer ${userToken()}`).send({ title: "Aufgabe" });
  const admin = await request(app).post("/api/events/not-a-uuid/tasks").set("Authorization", `Bearer ${adminToken()}`).send({ title: "Aufgabe" });
  assert.equal(user.status, 400);
  assert.equal(admin.status, 400);
});

test("Geschützte Auth-Endpunkte verlangen ein gültiges Token", async () => {
  const response = await request(app).get("/api/auth/me");
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "UNAUTHORIZED");
});

test("GET /api/health liefert den API-Status", async () => {
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("POST /api/events validiert Pflichtfelder", async () => {
  const response = await request(app).post("/api/events").set("Authorization", `Bearer ${adminToken()}`).send({ name: "Ohne Datum" });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});

test("unbekannte Routen liefern den zentralen Fehler", async () => {
  const response = await request(app).get("/api/does-not-exist").set("Authorization", `Bearer ${adminToken()}`);
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, "NOT_FOUND");
});

test("Ressourcenrouten validieren Event-IDs vor dem Datenbankzugriff", async () => {
  const routes = [
    "/api/events/not-a-uuid/tasks",
    "/api/events/not-a-uuid/members",
    "/api/events/not-a-uuid/costs",
    "/api/events/not-a-uuid/comments"
  ];

  for (const route of routes) {
    const response = await request(app).get(route).set("Authorization", `Bearer ${userToken()}`);
    assert.equal(response.status, 400, route);
    assert.equal(response.body.error.code, "VALIDATION_ERROR", route);
  }
});

test("Ressourcenrouten validieren Ressourcen-IDs vor dem Datenbankzugriff", async () => {
  const routes = [
    ["patch", "/api/tasks/not-a-uuid"],
    ["delete", "/api/tasks/not-a-uuid"],
    ["delete", "/api/members/not-a-uuid"],
    ["delete", "/api/costs/not-a-uuid"]
  ];

  for (const [method, route] of routes) {
    const isTaskDelete = method === "delete" && route.startsWith("/api/tasks/");
    const response = await request(app)[method](route).set("Authorization", `Bearer ${isTaskDelete ? userToken() : adminToken()}`).send({});
    assert.equal(response.status, isTaskDelete ? 403 : 400, `${method.toUpperCase()} ${route}`);
    assert.equal(response.body.error.code, isTaskDelete ? "FORBIDDEN" : "VALIDATION_ERROR", `${method.toUpperCase()} ${route}`);
  }
});

test("Aufgaben mit leerem Fälligkeitsdatum werden abgelehnt", async () => {
  const response = await request(app)
    .post("/api/events/00000000-0000-0000-0000-000000000000/tasks")
    .set("Authorization", `Bearer ${userToken()}`)
    .send({ title: "Aufgabe", dueDate: "" });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});
