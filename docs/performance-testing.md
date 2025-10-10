# Testes de Performance com k6

Este documento descreve como configurar e executar os testes de performance para a API usando k6.

## 📋 Pré-requisitos

### Instalação do k6

#### Windows (usando Chocolatey)
```bash
choco install k6
```

#### Windows (usando Scoop)
```bash
scoop install k6
```

#### Windows (Download direto)
1. Baixe o k6 do site oficial: https://k6.io/docs/get-started/installation/
2. Extraia o arquivo e adicione ao PATH do sistema

#### Verificação da instalação
```bash
k6 version
```

## 🚀 Executando os Testes

### Teste de Performance para GET /users

O arquivo `test/performance/get_users.test.js` contém testes abrangentes para o endpoint GET /users.

#### Execução Básica
```bash
# Navegar para o diretório do projeto
cd pgats-02-api

# Executar teste completo (todos os cenários)
k6 run test/performance/get_users.test.js

# Execução rápida para validação (10s, 2 usuários)
k6 run test/performance/get_users.test.js --duration 10s --vus 2
```

#### Cenários Disponíveis

1. **Load Test** (0-3 minutos)
   - Simula carga normal de usuários
   - 10 usuários virtuais simultâneos
   - Duração: 2 minutos

2. **Stress Test** (3-7 minutos)
   - Testa limites da aplicação
   - 50 usuários virtuais simultâneos
   - Duração: 4 minutos

3. **Spike Test** (7-8 minutos)
   - Simula picos súbitos de tráfego
   - Pico de 100 usuários por 10 segundos
   - Duração: 40 segundos

### Executar Cenários Específicos

```bash
# Apenas Load Test
k6 run test/performance/get_users.test.js --scenario load_test

# Apenas Stress Test
k6 run test/performance/get_users.test.js --scenario stress_test

# Apenas Spike Test
k6 run test/performance/get_users.test.js --scenario spike_test
```

## 📊 Métricas e Thresholds

### Métricas Monitoradas

- **http_req_duration**: Tempo de resposta das requisições
- **http_req_failed**: Taxa de falhas
- **http_reqs**: Requisições por segundo
- **http_req_receiving**: Tempo para receber resposta
- **http_req_sending**: Tempo para enviar requisição

### Critérios de Aceitação (Thresholds)

- ✅ 50% das requisições < 200ms
- ✅ 95% das requisições < 500ms
- ✅ 99% das requisições < 1000ms
- ✅ Taxa de erro < 1%
- ✅ Throughput > 10 req/s

### Thresholds por Cenário

- **Load Test**: 95% < 300ms
- **Stress Test**: 95% < 800ms
- **Spike Test**: 95% < 1200ms

## 🔍 Validações Realizadas

### Validações de Status
- Status HTTP 200
- Content-Type application/json
- Body não vazio

### Validações de Performance
- Tempo de resposta < 200ms, 500ms, 1000ms
- Estrutura correta dos dados retornados

### Validações de Dados
- Response é um array
- Usuários têm estrutura correta (username, favorecidos, saldo)
- Senha não está exposta no response

## 📈 Interpretando Resultados

### Exemplo de Output Esperado
```
✓ status é 200
✓ response time < 1000ms
✓ response time < 500ms
✓ content-type é JSON
✓ body não está vazio
✓ response é array
✓ usuários têm estrutura correta

checks.........................: 100.00% ✓ 2100 ✗ 0
data_received..................: 1.2 MB  40 kB/s
data_sent......................: 180 kB  6.0 kB/s
http_req_blocked...............: avg=1.2ms   min=0s     med=1ms    max=15ms   p(90)=2ms    p(95)=3ms
http_req_connecting............: avg=0.8ms   min=0s     med=0s     max=10ms   p(90)=1ms    p(95)=2ms
http_req_duration..............: avg=150ms   min=80ms   med=140ms  max=400ms  p(90)=200ms  p(95)=250ms
http_req_failed................: 0.00%   ✓ 0    ✗ 300
http_req_receiving.............: avg=2ms     min=1ms    med=2ms    max=8ms    p(90)=3ms    p(95)=4ms
http_req_sending...............: avg=0.5ms   min=0ms    med=0ms    max=2ms    p(90)=1ms    p(95)=1ms
http_req_waiting...............: avg=147ms   min=78ms   med=137ms  max=395ms  p(90)=197ms  p(95)=247ms
http_reqs......................: 300     10/s
iteration_duration.............: avg=2.15s   min=1.08s  med=2.14s  max=3.4s   p(90)=3.2s   p(95)=3.3s
iterations.....................: 300     10/s
vus............................: 10      min=0  max=10
vus_max........................: 10      min=10 max=10
```

## 🛠️ Troubleshooting

### API não está respondendo
Certifique-se de que a API está rodando em `http://localhost:3000`:
```bash
npm start
# ou
npm run dev
```

### Thresholds falhando
- Verifique se a API está otimizada
- Considere ajustar os thresholds conforme necessário
- Monitore recursos do sistema (CPU, memória)

### Erros de conexão
- Verifique se não há firewall bloqueando
- Confirme se a porta 3000 está disponível
- Teste manualmente: `curl http://localhost:3000/users`

## 📝 Próximos Passos

1. **Monitoramento Contínuo**: Integrar com CI/CD
2. **Métricas Customizadas**: Adicionar métricas específicas do negócio
3. **Testes Adicionais**: Criar testes para outros endpoints
4. **Relatórios**: Gerar relatórios HTML com `--out html=report.html`