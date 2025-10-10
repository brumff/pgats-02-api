const request = require("supertest");
const sinon = require("sinon");
const { expect } = require("chai");

const app = require("../../../app");
const userService = require("../../../service/userService");

describe("Users Controller", () => {
  describe("GET /users", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("Retorna 200 e estrutura esperada", async () => {
      const res = await request(app)
        .get("/users")
        .set("Accept", "application/json");

      expect(res.status).to.equal(200);
      expect(res.headers["content-type"]).to.include("application/json");
      expect(res.body).to.be.an("array");
      res.body.forEach((u) => {
        expect(u).to.have.property("username");
        expect(u).to.have.property("favorecidos");
        expect(u).to.have.property("saldo");
        expect(Object.prototype.hasOwnProperty.call(u, "password")).to.equal(
          false
        );
      });
    });

    it("Quando o service lança erro, responde 500", async () => {
      sinon.stub(userService, "listUsers").throws(new Error("Falha interna"));

      const res = await request(app).get("/users");
      expect(res.status).to.equal(500);
    });
  });
});
