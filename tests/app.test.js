import { afterAll, describe, expect, test } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";

afterAll(() => pool.end());

describe("rutas generales", () => {
  test("GET /health responde ok", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("una ruta inexistente responde 404 en JSON", async () => {
    const response = await request(app).get("/no-existe");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toContain("/no-existe");
  });

  test("GET /api-docs/ publica la documentación", async () => {
    const response = await request(app).get("/api-docs/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("swagger-ui");
  });
});
