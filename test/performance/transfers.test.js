import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 20 },
        { duration: '10s', target: 0 },
    ],

    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.02'],
    },
};

export default function () {
    const loginRes = http.post(
        'http://localhost:3000/users/login',
        JSON.stringify({ username: 'julio.lima', password: '123456' }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    const token = JSON.parse(loginRes.body).token;

    const url = 'http://localhost:3000/transfers';

    const payload = JSON.stringify({
        from: 'lucas.meira',
        to: 'julio.lima',
        value: 2
    });
    const res = http.post(url, payload, {
        headers: {
            'Content-Type': 'application/json', Authorization: `Bearer ${token}`
        }
    });

    check(res, {
        'status é 201': (r) => r.status === 201,

    });

    sleep(1);
}
