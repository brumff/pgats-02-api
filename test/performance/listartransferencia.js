import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  iterations: 10,
};

export default function () {
  // 1. Autenticação para obter o token
  const loginPayload = JSON.stringify({
    username: 'julio',
    password: '123456',
  });

  const loginRes = http.post('http://localhost:3000/users/login', loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  console.log('Login status:', loginRes.status);
  console.log('Login body:', loginRes.body);

  // Tenta extrair o token corretamente
  let token;
  try {
    const body = JSON.parse(loginRes.body);
    token = body.token; // ajuste aqui se o token vier em outro campo
  } catch (e) {
    console.error('❌ Erro ao interpretar JSON da resposta de login.');
  }

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'token foi retornado': () => token !== undefined,
  });

  if (!token) {
    console.error('⚠️ Token não foi retornado. Verifique a estrutura da resposta de login.');
    return;
  }

  // 2. Requisição autenticada com Bearer Token
  const res = http.get('http://localhost:3000/transfers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(res, {
    'transfers status is 200': (r) => r.status === 200,
  });

  console.log(`Transfers status: ${res.status}`);
  console.log(`Transfers body: ${res.body}`);

  sleep(1);
}
