import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";

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
