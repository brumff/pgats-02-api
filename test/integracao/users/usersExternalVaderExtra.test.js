const request = require("supertest");
const { expect } = require("chai");
require("dotenv").config();

describe("Usuários - Externo (VADER Extra)", () => {
  const BASE_URL = process.env.BASE_URL_REST || "http://localhost:3000";

  describe("GET /users - VADER complementares", () => {
    it("deve garantir negociação de conteúdo: mesmo com Accept XML retorna JSON", async () => {
      const res = await request(BASE_URL)
        .get("/users")
        .set("Accept", "application/xml");

      expect(res.status).to.equal(200);
      expect(res.headers["content-type"]).to.include("application/json");
      expect(res.body).to.be.an("array");
    });

    it("deve retornar JSON mesmo com Accept text/plain", async () => {
      const res = await request(BASE_URL)
        .get("/users")
        .set("Accept", "text/plain");
      expect(res.status).to.equal(200);
      expect(res.headers["content-type"]).to.include("application/json");
    });

    it("deve ter tempo de resposta aceitável (< 1000ms)", async () => {
      const start = Date.now();
      const res = await request(BASE_URL).get("/users");
      const duration = Date.now() - start;
      expect(res.status).to.equal(200);
      expect(duration).to.be.below(1000);
    });

    it("deve garantir que usernames são únicos", async () => {
      const res = await request(BASE_URL).get("/users");
      const usernames = res.body.map((u) => u.username);
      const set = new Set(usernames);
      expect(set.size).to.equal(usernames.length);
    });

    it("deve conter somente campos permitidos (username, favorecidos, saldo)", async () => {
      const res = await request(BASE_URL).get("/users");
      const allowed = ["username", "favorecidos", "saldo"];
      res.body.forEach((u) => {
        const keys = Object.keys(u);
        keys.forEach((k) => expect(allowed).to.include(k));
      });
    });

    it("deve garantir que todos os favorecidos são strings", async () => {
      const res = await request(BASE_URL).get("/users");
      res.body.forEach((u) => {
        expect(u.favorecidos).to.be.an("array");
        u.favorecidos.forEach((f) => expect(f).to.be.a("string"));
      });
    });

    it("deve retornar 404 para PATCH em /users (método não suportado)", async () => {
      const patchRes = await request(BASE_URL).patch("/users").send({});
      expect(patchRes.status).to.equal(404);
    });
  });
});
