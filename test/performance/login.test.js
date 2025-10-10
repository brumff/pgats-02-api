import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
    stages: [
        { duration: '1s', target: 1 },
        { duration: '4s', target: 1 },
        { duration: '1s', target: 0 },
    ],

    thresholds: {
        http_req_duration: ['p(90)<3000', 'max<5000'],
    },
};

export default function () {
    const loginRes = http.post(
        'http://localhost:3000/users/login',
        JSON.stringify({ username: 'julio.lima', password: '123456' }),
        { headers: { 'Content-Type': 'application/json' } }

    );
    const token = JSON.parse(loginRes.body).token;

    const url = 'http://localhost:3000/tranfers';

    const payload = JSON.stringify({
        username: 'julio.lima',
        password: '123456',
        favorecidos: [],
    });


    const res = http.post(url, payload, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });

    check(res, {
        'status é 200': (r) => r.status === 200,

    });

    sleep(1);
}
