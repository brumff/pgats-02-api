const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();

describe('Users - Externo', () => {
  const BASE_URL = process.env.BASE_URL_REST || 'http://localhost:3000';

  describe('GET /users', () => {
    it('Retorna 200 e uma lista de usuários em JSON', async () => {
      const res = await request(BASE_URL)
        .get('/users')
        .set('Accept', 'application/json');

      expect(res.status).to.equal(200);
      expect(res.headers['content-type']).to.include('application/json');
      expect(res.body).to.be.an('array');

      res.body.forEach((u) => {
        expect(u).to.have.property('username');
        expect(u).to.have.property('favorecidos');
        expect(u.favorecidos).to.be.an('array');
        expect(u).to.have.property('saldo');
        expect(u.saldo).to.be.a('number');
        expect(Object.prototype.hasOwnProperty.call(u, 'password')).to.equal(false);
      });
    });

    it('Com token inválido ainda retorna 200 (rota pública)', async () => {
      const res = await request(BASE_URL)
        .get('/users')
        .set('Authorization', 'Bearer token_invalido');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('Idempotência: duas chamadas consecutivas retornam mesmo conteúdo', async () => {
      const res1 = await request(BASE_URL).get('/users');
      const res2 = await request(BASE_URL).get('/users');

      expect(res1.status).to.equal(200);
      expect(res2.status).to.equal(200);
      expect(res1.body).to.deep.equal(res2.body);
    });

    it('Lista inicial contém usuários conhecidos (julio e priscila)', async () => {
      const res = await request(BASE_URL).get('/users');
      const usernames = res.body.map((u) => u.username);
      expect(usernames).to.include('julio');
      expect(usernames).to.include('priscila');
    });

    it('Após registrar novo usuário, GET /users inclui o novo registro', async () => {
      const novoUsuario = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const registro = await request(BASE_URL)
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send({ username: novoUsuario, password: '123456', favorecidos: [] });

      expect(registro.status).to.be.oneOf([200, 201]);

      const res = await request(BASE_URL).get('/users');
      const usernames = res.body.map((u) => u.username);
      expect(usernames).to.include(novoUsuario);
    });

    it('Métodos não suportados em /users retornam 404', async () => {
      const postRes = await request(BASE_URL).post('/users').send({});
      const putRes = await request(BASE_URL).put('/users').send({});
      const delRes = await request(BASE_URL).delete('/users');

      expect(postRes.status).to.equal(404);
      expect(putRes.status).to.equal(404);
      expect(delRes.status).to.equal(404);
    });
  });
});