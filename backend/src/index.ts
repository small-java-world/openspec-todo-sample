import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import 'dotenv/config';
import auth from './routes/auth.js';
import todos from './routes/todos.js';

const app = new Hono();

// ミドルウェア
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ルート
app.get('/', (c) => {
  return c.json({ 
    message: 'TODO API Server with Authentication',
    version: '2.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (requires auth)',
      },
      todos: {
        list: 'GET /api/todos (requires auth)',
        create: 'POST /api/todos (requires auth)',
        update: 'PUT /api/todos/:id (requires auth)',
        delete: 'DELETE /api/todos/:id (requires auth)',
      }
    }
  });
});

// ルートをマウント
app.route('/api/auth', auth);
app.route('/api/todos', todos);

// 404ハンドラー
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// エラーハンドラー
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// サーバー起動
const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Server is running on http://localhost:${port}`);
console.log(`📝 API Documentation: http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
