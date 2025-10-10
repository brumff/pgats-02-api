const request = require('supertest');
const { expect } = require('chai')
require('dotenv').config() 
const postLogin = require('../../fixtures/postLogin.json')

describe('Login', () => {
    describe('POST /login', () => {
        it('Deve retornar 200 com um token em string quando usar credenciais válidas', async () => {
            const bodyLogin = { ...postLogin }
            const resposta = await request(process.env.BASE_URL)
                .post('/users/login')
                .set('Content-Type', 'application/json')
                .send(bodyLogin)

            expect(resposta.status).to.equal(200);
            expect(resposta.body.token).to.be.a('string');
        })

        it('Deve retornar 400 quando credenciais informadas foram inválidas', async () => {
            const bodyLogin = { ...postLogin }
            bodyLogin.username = " "
            bodyLogin.password = " "

            const resposta = await request(process.env.BASE_URL)
                .post('/users/login')
                .set('Content-Type', 'application/json')
                .send(bodyLogin)

            expect(resposta.status).to.equal(400);

        })
    })

    
})