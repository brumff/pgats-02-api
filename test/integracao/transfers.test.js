const request = require('supertest');
const { expect } = require('chai')
require('dotenv').config()
const postTransfers = require('../../fixtures/postTransfers.json');

describe('Transferencias ', () => {
    let token;

    before(async () => {

        const loginResponse = await request(process.env.BASE_URL)
            .post('/users/login')
            .send({
                username: 'julio.lima',
                password: '123456'
            });

        expect(loginResponse.status).to.equal(200);
        expect(loginResponse.body).to.have.property('token');

        token = loginResponse.body.token;
    });

    describe('POST /transfers', () => {
        it('Deve retornar 201 quando transferencia for realizada com sucesso', async () => {
            const bodyTransfers = { ...postTransfers }

            const resposta = await request(process.env.BASE_URL)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .send(bodyTransfers)
            expect(resposta.status).to.equal(201);
        })

        it('Deve retornar 401 token não for enviado', async () => {
            const bodyTransfers = { ...postTransfers }
            const resposta = await request(process.env.BASE_URL)
                .post('/transfers')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer `)
                .send(bodyTransfers)
            expect(resposta.status).to.equal(401);
        })



    })
})
