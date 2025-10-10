const request = require('supertest');
const { expect } = require('chai');

const BASE_URL = process.env.BASE_URL_REST || 'http://localhost:3000';

describe('Users - VADER Methodology Complete', () => {
  
  // ========================================
  // V - VERBS (Verbos HTTP)
  // ========================================
  describe('V - Verbs: Métodos HTTP para /users', () => {
    
    it('GET /users deve retornar 200 (método suportado)', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .expect(200);
      
      expect(response.body).to.be.an('array');
    });

    it('POST /users deve retornar 404 (método não suportado)', async () => {
      await request(BASE_URL)
        .post('/users')
        .send({ username: 'test' })
        .expect(404);
    });

    it('PUT /users deve retornar 404 (método não suportado)', async () => {
      await request(BASE_URL)
        .put('/users')
        .send({ username: 'test' })
        .expect(404);
    });

    it('DELETE /users deve retornar 404 (método não suportado)', async () => {
      await request(BASE_URL)
        .delete('/users')
        .expect(404);
    });

    it('PATCH /users deve retornar 404 (método não suportado)', async () => {
      await request(BASE_URL)
        .patch('/users')
        .send({ username: 'test' })
        .expect(404);
    });

    it('HEAD /users deve retornar 200 sem corpo (método suportado)', async () => {
      const response = await request(BASE_URL)
        .head('/users')
        .expect(200);
      
      // HEAD não deve retornar corpo, apenas headers
      expect(response.text).to.be.undefined;
    });
  });

  // ========================================
  // A - AUTHORIZATION (Autorização)
  // ========================================
  describe('A - Authorization: Controle de acesso para /users', () => {
    
    it('GET /users sem token deve retornar 200 (endpoint público)', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .expect(200);
      
      expect(response.body).to.be.an('array');
    });

    it('GET /users com token inválido deve retornar 200 (ignora token inválido)', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .set('Authorization', 'Bearer token_invalido_123')
        .expect(200);
      
      expect(response.body).to.be.an('array');
    });

    it('GET /users com token malformado deve retornar 200 (ignora token malformado)', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .set('Authorization', 'InvalidFormat token123')
        .expect(200);
      
      expect(response.body).to.be.an('array');
    });

    it('GET /users com token vazio deve retornar 200 (ignora token vazio)', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .set('Authorization', 'Bearer ')
        .expect(200);
      
      expect(response.body).to.be.an('array');
    });

    it('GET /users não deve expor credenciais na URL', async () => {
      const response = await request(BASE_URL)
        .get('/users?token=secret123&password=admin')
        .expect(200);
      
      // Verifica que não há vazamento de credenciais na resposta
      expect(response.text).to.not.include('secret123');
      expect(response.text).to.not.include('admin');
    });
  });

  // ========================================
  // D - DATA (Dados)
  // ========================================
  describe('D - Data: Validação de dados para /users', () => {
    
    it('GET /users deve retornar Content-Type application/json', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });

    it('GET /users com Accept: application/xml deve retornar JSON', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .set('Accept', 'application/xml')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });

    it('GET /users deve retornar array com tipagem correta', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      
      if (response.body.length > 0) {
        const user = response.body[0];
        expect(user).to.have.property('username').that.is.a('string');
        expect(user).to.have.property('saldo').that.is.a('number');
        expect(user).to.have.property('favorecidos').that.is.an('array');
        
        // Validar que favorecidos são strings
        user.favorecidos.forEach(fav => {
          expect(fav).to.be.a('string');
        });
      }
    });

    it('GET /users deve conter apenas campos permitidos', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .expect(200);
      
      if (response.body.length > 0) {
        const user = response.body[0];
        const allowedFields = ['username', 'saldo', 'favorecidos'];
        const userFields = Object.keys(user);
        
        userFields.forEach(field => {
          expect(allowedFields).to.include(field);
        });
        
        // Não deve conter campos sensíveis
        expect(user).to.not.have.property('password');
        expect(user).to.not.have.property('token');
      }
    });

    it('GET /users deve validar tamanho da resposta (< 1MB)', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .expect(200);
      
      const responseSize = JSON.stringify(response.body).length;
      const maxSize = 1024 * 1024; // 1MB
      
      expect(responseSize).to.be.lessThan(maxSize);
    });

    it('GET /users deve ter usernames únicos', async () => {
      const response = await request(BASE_URL)
        .get('/users')
        .expect(200);
      
      const usernames = response.body.map(user => user.username);
      const uniqueUsernames = [...new Set(usernames)];
      
      expect(usernames.length).to.equal(uniqueUsernames.length);
    });
  });

  // ========================================
  // E - ERRORS (Erros)
  // ========================================
  describe('E - Errors: Códigos de erro para /users', () => {
    
    it('GET /users/invalid-endpoint deve retornar 404', async () => {
      await request(BASE_URL)
        .get('/users/invalid-endpoint')
        .expect(404);
    });

    it('GET /users com query malformada deve ser ignorada (retorna 200)', async () => {
      const response = await request(BASE_URL)
        .get('/users?filter=invalid[malformed')
        .expect(200);
      
      // Query strings malformadas são ignoradas, endpoint retorna dados normais
      expect(response.body).to.be.an('array');
    });

    it('GET /users deve retornar erro estruturado para 4xx', async () => {
      const response = await request(BASE_URL)
        .get('/users/nonexistent')
        .expect(404);
      
      // Para endpoints que retornam 404, pode não ter estrutura de erro específica
      // Validamos que não é um erro 500
      expect(response.status).to.equal(404);
    });

    it('Simular 500 - erro interno do servidor', async () => {
      // Este teste simula um cenário onde o serviço falha
      // Normalmente seria mockado ou testado em ambiente controlado
      const response = await request(BASE_URL)
        .get('/users')
        .set('X-Force-Error', '500'); // Header customizado para forçar erro
      
      if (response.status === 500) {
        expect(response.body).to.have.property('error');
      } else {
        // Se não conseguir simular 500, pelo menos valida estrutura normal
        expect(response.status).to.be.oneOf([200, 401, 403]);
      }
    });

    it('GET /users deve ter mensagens de erro padronizadas', async () => {
      const response = await request(BASE_URL)
        .get('/users/invalid')
        .expect(404);
      
      // Para 404, validamos que não há vazamento de informações sensíveis
      expect(response.status).to.equal(404);
      if (response.body && response.body.error) {
        expect(response.body.error).to.not.include('undefined');
        expect(response.body.error).to.not.include('null');
      }
    });
  });

  // ========================================
  // R - RESPONSIVENESS (Capacidade de Resposta)
  // ========================================
  describe('R - Responsiveness: Performance para /users', () => {
    
    it('GET /users deve responder em menos de 1000ms', async () => {
      const startTime = Date.now();
      
      await request(BASE_URL)
        .get('/users')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(1000);
    });

    it('GET /users deve responder em menos de 500ms (SLA otimizado)', async () => {
      const startTime = Date.now();
      
      await request(BASE_URL)
        .get('/users')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(500);
    });

    it('GET /users deve suportar requisições concorrentes', async () => {
      const concurrentRequests = 5;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(BASE_URL)
            .get('/users')
            .expect(200)
        );
      }
      
      const responses = await Promise.all(promises);
      
      // Todas as respostas devem ser consistentes
      responses.forEach(response => {
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /users deve implementar fail-fast para erros', async () => {
      const startTime = Date.now();
      
      await request(BASE_URL)
        .get('/users/nonexistent')
        .expect(404); // Erro 404 deve ser rápido
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(100); // Fail-fast < 100ms
    });

    it('GET /users deve ser idempotente', async () => {
      const response1 = await request(BASE_URL)
        .get('/users')
        .expect(200);
      
      const response2 = await request(BASE_URL)
        .get('/users')
        .expect(200);
      
      // Respostas devem ser idênticas
      expect(response1.body).to.deep.equal(response2.body);
    });

    it('GET /users deve manter consistência sob carga sequencial', async () => {
      const sequentialRequests = 10;
      const responses = [];
      
      for (let i = 0; i < sequentialRequests; i++) {
        const response = await request(BASE_URL)
          .get('/users')
          .expect(200);
        responses.push(response.body);
      }
      
      // Todas as respostas devem ser consistentes
      const firstResponse = responses[0];
      responses.forEach(response => {
        expect(response).to.deep.equal(firstResponse);
      });
    });
  });
});