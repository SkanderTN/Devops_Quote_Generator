const request = require('supertest');
const app = require('../index');

// Store server reference for cleanup
let server;

beforeAll(() => {
  // Start server on a different port for testing
  server = app.listen(3001);
});

afterAll((done) => {
  server.close(done);
});

describe('Quote Generator API', () => {
  
  // Health check test
  describe('GET /', () => {
    it('should return health check with status healthy', async () => {
      const res = await request(app).get('/');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('Quote Generator API');
    });
  });

  // Random quote test
  describe('GET /quote', () => {
    it('should return a random quote with author', async () => {
      const res = await request(app).get('/quote');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quote');
      expect(res.body).toHaveProperty('author');
      expect(typeof res.body.quote).toBe('string');
      expect(typeof res.body.author).toBe('string');
    });
  });

  // All quotes test
  describe('GET /quotes', () => {
    it('should return all quotes with count', async () => {
      const res = await request(app).get('/quotes');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('count');
      expect(res.body).toHaveProperty('quotes');
      expect(Array.isArray(res.body. quotes)).toBe(true);
      expect(res.body.count).toBe(res.body.quotes.length);
    });
  });

  // Quote by ID tests
  describe('GET /quotes/: id', () => {
    it('should return a specific quote by ID', async () => {
      const res = await request(app).get('/quotes/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body. id).toBe(1);
      expect(res.body).toHaveProperty('text');
      expect(res.body).toHaveProperty('author');
    });

    it('should return 404 for non-existent quote', async () => {
      const res = await request(app).get('/quotes/999');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Quote not found');
    });
  });

  // 404 handler test
  describe('Invalid routes', () => {
    it('should return 404 for undefined routes', async () => {
      const res = await request(app).get('/invalid-route');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
    });
  });

});