import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuração de cenários de performance
export const options = {
  scenarios: {
    // Cenário 1: Load Test - Carga normal
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // Ramp up para 10 usuários
        { duration: '1m', target: 10 },   // Manter 10 usuários
        { duration: '30s', target: 0 },   // Ramp down
      ],
      gracefulRampDown: '10s',
    },
    
    // Cenário 2: Stress Test - Carga alta
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },   // Ramp up para 50 usuários
        { duration: '2m', target: 50 },   // Manter 50 usuários
        { duration: '1m', target: 0 },    // Ramp down
      ],
      gracefulRampDown: '30s',
      startTime: '3m',  // Inicia após o load test
    },
    
    // Cenário 3: Spike Test - Picos de carga
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },   // Baseline
        { duration: '10s', target: 100 }, // Spike súbito
        { duration: '10s', target: 5 },   // Volta ao baseline
        { duration: '10s', target: 0 },   // Finaliza
      ],
      startTime: '7m',  // Inicia após stress test
    },
  },
  
  // Thresholds - Critérios de aceitação
  thresholds: {
    // Tempo de resposta
    'http_req_duration': [
      'p(50)<200',    // 50% das requisições < 200ms
      'p(95)<500',    // 95% das requisições < 500ms
      'p(99)<1000',   // 99% das requisições < 1s
    ],
    
    // Taxa de erro
    'http_req_failed': ['rate<0.01'], // < 1% de falhas
    
    // Requisições por segundo
    'http_reqs': ['rate>10'], // > 10 req/s
    
    // Thresholds específicos por cenário
    'http_req_duration{scenario:load_test}': ['p(95)<300'],
    'http_req_duration{scenario:stress_test}': ['p(95)<800'],
    'http_req_duration{scenario:spike_test}': ['p(95)<1200'],
  },
};

// URL base da API
const BASE_URL = 'http://localhost:3000';

export default function () {
  // Teste do endpoint GET /users
  const response = http.get(`${BASE_URL}/users`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'k6-performance-test/1.0',
    },
  });

  // Validações de performance
  check(response, {
    'status é 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'content-type é JSON': (r) => r.headers['Content-Type'].includes('application/json'),
    'body não está vazio': (r) => r.body.length > 0,
    'response é array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data);
      } catch (e) {
        return false;
      }
    },
    'usuários têm estrutura correta': (r) => {
      try {
        const users = JSON.parse(r.body);
        if (!Array.isArray(users) || users.length === 0) return true;
        
        const firstUser = users[0];
        return (
          firstUser.hasOwnProperty('username') &&
          firstUser.hasOwnProperty('favorecidos') &&
          firstUser.hasOwnProperty('saldo') &&
          !firstUser.hasOwnProperty('password') // Senha não deve estar exposta
        );
      } catch (e) {
        return false;
      }
    },
  });

  // Log de métricas importantes (apenas para alguns casos)
  if (Math.random() < 0.1) { // 10% das requisições
    console.log(`Response time: ${response.timings.duration.toFixed(2)}ms | Status: ${response.status} | Size: ${response.body.length} bytes`);
  }

  // Simula tempo de processamento do usuário
  sleep(Math.random() * 2 + 1); // Entre 1-3 segundos
}

// Função de setup - executada uma vez antes dos testes
export function setup() {
  console.log('🚀 Iniciando testes de performance para GET /users');
  console.log('📊 Cenários configurados: Load Test, Stress Test, Spike Test');
  
  // Verifica se a API está respondendo
  const healthCheck = http.get(`${BASE_URL}/users`);
  if (healthCheck.status !== 200) {
    throw new Error(`❌ API não está respondendo. Status: ${healthCheck.status}`);
  }
  
  console.log('✅ API está online e respondendo');
  return { timestamp: new Date().toISOString() };
}

// Função de teardown - executada uma vez após todos os testes
export function teardown(data) {
  console.log('🏁 Testes de performance finalizados');
  console.log(`📅 Iniciado em: ${data.timestamp}`);
  console.log(`📅 Finalizado em: ${new Date().toISOString()}`);
  console.log('📈 Verifique os resultados das métricas acima');
}