const express = require('express');
const app = express();

// ============================================
// QUOTE DATA (in-memory storage)
// ============================================
const quotes = [
  { id:  1, text: 'The only limit to our realization of tomorrow is our doubts of today.', author: 'Franklin D. Roosevelt' },
  { id: 2, text: 'Life is 10% what happens to us and 90% how we react to it.', author: 'Charles R.  Swindoll' },
  { id: 3, text:  'The purpose of our lives is to be happy.', author: 'Dalai Lama' },
  { id: 4, text:  'Get busy living or get busy dying.', author: 'Stephen King' },
  { id:  5, text: 'You only live once, but if you do it right, once is enough.', author: 'Mae West' },
  { id: 6, text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { id:  7, text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { id: 8, text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { id: 9, text:  'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { id:  10, text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { id: 11, text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { id: 12, text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' }
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const getRandomQuote = () => {
  const randomIndex = Math. floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

// ============================================
// MIDDLEWARE
// ============================================
app. use(express.json());

// Simple request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Quote Generator API',
    status: 'healthy',
    version: '1.0.0',
    endpoints: {
      'GET /': 'Health check (this endpoint)',
      'GET /quote': 'Get a random quote',
      'GET /quotes': 'Get all quotes',
      'GET /quotes/:id': 'Get quote by ID'
    }
  });
});

// Get a random quote
app.get('/quote', (req, res) => {
  const quote = getRandomQuote();
  res.json({
    quote: quote.text,
    author: quote.author
  });
});

// Get all quotes
app.get('/quotes', (req, res) => {
  res.json({
    count: quotes.length,
    quotes: quotes
  });
});

// Get quote by ID
app.get('/quotes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const quote = quotes. find(q => q.id === id);
  
  if (!quote) {
    return res.status(404).json({
      error: 'Quote not found',
      message: `No quote exists with ID:  ${id}`
    });
  }
  
  res.json(quote);
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} does not exist`,
    availableEndpoints: ['GET /', 'GET /quote', 'GET /quotes', 'GET /quotes/:id']
  });
});

// ============================================
// SERVER STARTUP
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🎉 Quote Generator API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`💬 Random quote: http://localhost:${PORT}/quote`);
  console.log(`📚 All quotes:    http://localhost:${PORT}/quotes`);
});

module.exports = app; 