const express = require('express');
const client = require('prom-client');
const { v4: uuidv4 } = require('uuid');

const app = express();

// ============================================
// PROMETHEUS METRICS SETUP
// ============================================
const register = new client.Registry();

// Add default Node.js metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metric:  Total HTTP requests counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Custom metric: Request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames:  ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// ============================================
// QUOTE DATA
// ============================================
const quotes = [
  { id: 1, text: 'The only limit to our realization of tomorrow is our doubts of today.', author: 'Franklin D. Roosevelt' },
  { id: 2, text: 'Life is 10% what happens to us and 90% how we react to it.', author: 'Charles R. Swindoll' },
  { id: 3, text: 'The purpose of our lives is to be happy.', author: 'Dalai Lama' },
  { id: 4, text: 'Get busy living or get busy dying.', author: 'Stephen King' },
  { id: 5, text: 'You only live once, but if you do it right, once is enough.', author: 'Mae West' },
  { id: 6, text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { id: 7, text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { id: 8, text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { id: 9, text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { id: 10, text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { id: 11, text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { id: 12, text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' }
];

const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

// ============================================
// MIDDLEWARE
// ============================================
app. use(express.json());

// Request ID & Tracing Middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Logging & Metrics Middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request start
  console.log(JSON.stringify({
    level: 'info',
    type: 'request_start',
    requestId: req.id,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  }));

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?. path || req.url;

    // Record metrics
    httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route }, duration);

    // Log request completion
    console.log(JSON.stringify({
      level: 'info',
      type:  'request_complete',
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      durationMs: Math.round(duration * 1000),
      timestamp: new Date().toISOString()
    }));
  });

  next();
});

// ============================================
// ROUTES
// ============================================
app.get('/', (req, res) => {
  res.json({
    service: 'Quote Generator API',
    status: 'healthy',
    version: '1.0.0',
    requestId: req.id,
    endpoints: {
      'GET /': 'Health check',
      'GET /quote': 'Get random quote',
      'GET /quotes': 'Get all quotes',
      'GET /quotes/:id': 'Get quote by ID',
      'GET /metrics': 'Prometheus metrics'
    }
  });
});

app.get('/quote', (req, res) => {
  const quote = getRandomQuote();
  res.json({ quote: quote.text, author: quote.author, requestId: req.id });
});

app.get('/quotes', (req, res) => {
  res.json({ count: quotes.length, quotes, requestId: req.id });
});

app.get('/quotes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const quote = quotes.find(q => q.id === id);
  
  if (!quote) {
    return res.status(404).json({ error: 'Quote not found', message: `No quote with ID: ${id}`, requestId: req.id });
  }
  res.json({ ...quote, requestId: req.id });
});

// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.url} does not exist`, requestId: req.id });
});

// ============================================
// SERVER STARTUP
// ============================================
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(JSON.stringify({ level: 'info', type: 'server_start', port: PORT, timestamp: new Date().toISOString() }));
    console.log(`🎉 Quote API:  http://localhost:${PORT}`);
    console.log(`📊 Metrics:    http://localhost:${PORT}/metrics`);
  });
}

module.exports = app;