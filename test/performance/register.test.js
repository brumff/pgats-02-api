import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '45', target: 10 },
        { duration: '10', target: 0 },
    ],

    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.02'],
    },
};

export default function () {
    const url = 'http://localhost:3000/users/register';


    const randomId = Math.floor(Math.random() * 1000000);
    const payload = JSON.stringify({
        username: `user_${randomId}`,
        password: `pass_${randomId}`,
        favorecidos: [],
    });

    const headers = { 'Content-Type': 'application/json' };

    const res = http.post(url, payload, { headers });

    check(res, {
        'status é 201': (r) => r.status === 201,

    });

    sleep(1);
}
