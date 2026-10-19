import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";
import { hashPassword, verifyPassword } from "../src/services/auth.js";

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
  const response = await request(app).post("/api/events").send({ name: "Ohne Datum" });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});

test("unbekannte Routen liefern den zentralen Fehler", async () => {
  const response = await request(app).get("/api/does-not-exist");
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
    const response = await request(app).get(route);
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
    const response = await request(app)[method](route).send({});
    assert.equal(response.status, 400, `${method.toUpperCase()} ${route}`);
    assert.equal(response.body.error.code, "VALIDATION_ERROR", `${method.toUpperCase()} ${route}`);
  }
});

test("Aufgaben mit leerem Fälligkeitsdatum werden abgelehnt", async () => {
  const response = await request(app)
    .post("/api/events/00000000-0000-0000-0000-000000000000/tasks")
    .send({ title: "Aufgabe", dueDate: "" });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});
