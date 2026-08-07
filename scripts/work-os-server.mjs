import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';
import {
  addComment,
  addSubtask,
  createTask,
  publicState,
  readEvents,
  readPolicy,
  reviewSubtask,
  setDecision,
  startSubtask,
  submitSubtask
} from './work-os-core.mjs';

const root = process.cwd();
const staticRoot = path.resolve(root, 'tools/work-os');
const policy = readPolicy();
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const host = arg('--host', policy.ui.bindAddress || '127.0.0.1');
const port = Number(arg('--port', String(policy.ui.defaultPort || 4177)));
if (host !== '127.0.0.1' && host !== 'localhost' && !args.includes('--allow-remote')) {
  console.error('Remote Work OS binding is blocked by default. Use --allow-remote only after explicit project-owner approval and add authentication/reverse-proxy controls first.');
  process.exit(1);
}

function send(res, status, body, contentType = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Opener-Policy': 'same-origin'
  });
  res.end(Buffer.isBuffer(body) ? body : typeof body === 'string' ? body : JSON.stringify(body));
}

function safeStaticPath(urlPath) {
  const clean = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const target = path.resolve(staticRoot, clean);
  return target.startsWith(staticRoot) ? target : null;
}

function bodyJson(req, limit = 256 * 1024) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > limit) {
        reject(new Error('Request body is too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch (error) { reject(new Error(`Invalid JSON body: ${error.message}`)); }
    });
    req.on('error', reject);
  });
}

function routeMatch(pathname, pattern) {
  const p = pathname.split('/').filter(Boolean);
  const q = pattern.split('/').filter(Boolean);
  if (p.length !== q.length) return null;
  const params = {};
  for (let i = 0; i < q.length; i += 1) {
    if (q[i].startsWith(':')) params[q[i].slice(1)] = decodeURIComponent(p[i]);
    else if (q[i] !== p[i]) return null;
  }
  return params;
}

const server = http.createServer(async (req, res) => {
  const requestHost = String(req.headers.host || '');
  const allowedHosts = new Set([`${host}:${port}`, `127.0.0.1:${port}`, `localhost:${port}`]);
  if (!allowedHosts.has(requestHost)) return send(res, 403, { error: 'Invalid Host header' });
  const origin = String(req.headers.origin || '');
  if (req.method !== 'GET' && origin) {
    const allowedOrigins = new Set([`http://${host}:${port}`, `http://127.0.0.1:${port}`, `http://localhost:${port}`]);
    if (!allowedOrigins.has(origin)) return send(res, 403, { error: 'Cross-origin write blocked' });
  }
  const url = new URL(req.url || '/', `http://${requestHost}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/state') return send(res, 200, publicState());
    if (req.method === 'GET' && url.pathname === '/api/events') return send(res, 200, readEvents(Number(url.searchParams.get('limit') || 300)));

    if (req.method === 'POST' && url.pathname === '/api/tasks') {
      const body = await bodyJson(req);
      return send(res, 201, createTask({ ...body, actor: body.actor || 'project-owner' }));
    }

    let params = routeMatch(url.pathname, '/api/tasks/:taskId/subtasks');
    if (req.method === 'POST' && params) {
      const body = await bodyJson(req);
      return send(res, 201, addSubtask(params.taskId, { ...body, actor: body.actor || 'qarga-coordinator' }));
    }

    params = routeMatch(url.pathname, '/api/tasks/:taskId/comments');
    if (req.method === 'POST' && params) {
      const body = await bodyJson(req);
      return send(res, 201, addComment(params.taskId, { ...body, author: body.author || 'project-owner' }));
    }

    params = routeMatch(url.pathname, '/api/tasks/:taskId/decision');
    if (req.method === 'POST' && params) {
      const body = await bodyJson(req);
      return send(res, 200, setDecision(params.taskId, body));
    }

    params = routeMatch(url.pathname, '/api/tasks/:taskId/subtasks/:subtaskId/start');
    if (req.method === 'POST' && params) {
      const body = await bodyJson(req);
      return send(res, 200, startSubtask(params.taskId, params.subtaskId, body.agent));
    }

    params = routeMatch(url.pathname, '/api/tasks/:taskId/subtasks/:subtaskId/submit');
    if (req.method === 'POST' && params) {
      const body = await bodyJson(req);
      return send(res, 200, submitSubtask(params.taskId, params.subtaskId, body));
    }

    params = routeMatch(url.pathname, '/api/tasks/:taskId/subtasks/:subtaskId/review');
    if (req.method === 'POST' && params) {
      const body = await bodyJson(req);
      return send(res, 200, reviewSubtask(params.taskId, params.subtaskId, body));
    }

    if (req.method === 'GET') {
      const file = safeStaticPath(url.pathname);
      if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, { error: 'Not found' });
      const ext = path.extname(file);
      const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
      return send(res, 200, fs.readFileSync(file), types[ext] || 'application/octet-stream');
    }

    return send(res, 404, { error: 'Not found' });
  } catch (error) {
    return send(res, 400, { error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`Qarğa Work OS is running at http://${host}:${port}`);
  console.log('The server binds to localhost by default and is intended for internal project operations only.');
});
