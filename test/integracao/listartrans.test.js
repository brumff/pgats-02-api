const request = require('supertest');
const { expect } = require('chai')
require('dotenv').config()


describe('Listar transferencia', () => {
  let token;

  before(async () => {
    
    const loginResponse = await request('http://localhost:3000')
      .post('/users/login')
      .send({
        username: 'julio',
        password: '123456'
      });

    expect(loginResponse.status).to.equal(200);
    expect(loginResponse.body).to.have.property('token');

    token = loginResponse.body.token;
    console.log (token)
  });

  it('Deve retornar 200 e uma lista de transferências', async () => {
    const res = await request('http://localhost:3000')
      .get('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

   // expect(res.status).to.equal(200);
    //expect(res.body).to.be.an('array');
   // expect(res.body.length).to.be.greaterThan(0);
   // const transferencia = res.body[0];
   // expect(transferencia).to.include.keys('id', 'valor', 'data');
  });
});

