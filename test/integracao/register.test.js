const request = require('supertest');
const { expect } = require('chai')
require('dotenv').config()
const postRegister = require('../../fixtures/postRegister.json');

describe('Registrar novo usuário', () => {
    describe('POST /users/register', () => {
        it('Deve retornar 201 quando usuário for criado com sucesso', async () => {
            const bodyRegister = { ...postRegister }
            bodyRegister.username = "ze.lima"
            bodyRegister.password = "123456"
            const resposta = await request(process.env.BASE_URL)
                .post('/users/register')
                .set('Content-Type', 'application/json')
                .send(bodyRegister)

            expect(resposta.status).to.equal(201
            );
        })

        it('Deve retornar 400 quando usuário já existe', async () => {
            const bodyRegister = { ...postRegister }
            const resposta = await request(process.env.BASE_URL)
                .post('/users/register')
                .set('Content-Type', 'application/json')
                .send(bodyRegister)

            expect(resposta.status).to.equal(400);
        })

        

    })
})
