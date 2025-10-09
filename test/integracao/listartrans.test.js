const request = require('supertest');
const { expect } = require('chai')
require('dotenv').config()


describe('Listar transferencia', () => {
  let token;

  before(async () => {

    const loginResponse = await request(process.env.BASE_URL)
      .post('/users/login')
      .send({
        username: 'julio',
        password: '123456'
      });

    expect(loginResponse.status).to.equal(200);
    expect(loginResponse.body).to.have.property('token');

    token = loginResponse.body.token;

  });

  it('Deve retornar 200 e uma lista de transferências', async () => {
    const res = await request(process.env.BASE_URL)
      .get('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');


    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');

  });
});

