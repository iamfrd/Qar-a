import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL;
if (!baseUrl) throw new Error('BASE_URL is required. Never default a load test to production.');

export const options = {
  vus: Number(__ENV.VUS || 3),
  duration: __ENV.DURATION || '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000']
  }
};

export default function () {
  const response = http.get(baseUrl, { tags: { flow: 'app-shell' } });
  check(response, { 'status is successful': (r) => r.status >= 200 && r.status < 400 });
  sleep(1);
}
