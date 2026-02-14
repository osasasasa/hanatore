import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { evaluateAnswer, type EvaluationRequest } from './services/ai.js';
import { isGeminiAvailable } from './lib/gemini.js';

// Routes
import usersRouter from './routes/users.js';
import questionsRouter from './routes/questions.js';
import trainingRouter from './routes/training.js';
import leagueRouter from './routes/league.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Hanatore API',
    version: '1.0.0',
    status: 'ok',
  });
});

// API Routes
const api = new Hono();

// Mount routers
api.route('/users', usersRouter);
api.route('/questions', questionsRouter);
api.route('/training', trainingRouter);
api.route('/league', leagueRouter);

// AI Evaluation (direct endpoint)
api.post('/ai/evaluate', async (c) => {
  const body = await c.req.json();

  const request: EvaluationRequest = {
    question: body.question || '',
    answer: body.answer || '',
    method: body.method,
    mode: body.mode,
    difficulty: body.difficulty,
  };

  const result = await evaluateAnswer(request);
  return c.json(result);
});

// AI Status
api.get('/ai/status', (c) => {
  return c.json({
    available: isGeminiAvailable(),
    model: 'gemini-1.5-flash',
  });
});

// Subscription
api.get('/subscription/status', (c) => {
  return c.json({
    plan: 'free',
    status: 'active',
  });
});

// Mount API routes
app.route('/api', api);

// Error handling
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json(
    {
      error: 'internal_error',
      message: err.message || 'An unexpected error occurred',
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'not_found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
});

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`Hanatore API running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
