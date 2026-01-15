const request = require('supertest');
const app = require('../index');

let server;

beforeAll(() => {
  server = app.listen(3001);
});

afterAll((done) => {
  server.close(done);
});

describe('Quote Generator API', () => {
  
  describe('GET /', () => {
    it('should return health check with status healthy', async () => {
      const res = await request(app).get('/');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('Quote Generator API');
    });

    it('should include requestId in response', async () => {
      const res = await request(app).get('/');
      
      expect(res.body).toHaveProperty('requestId');
      expect(res.headers).toHaveProperty('x-request-id');
    });
  });

  describe('GET /quote', () => {
    it('should return a random quote with author', async () => {
      const res = await request(app).get('/quote');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quote');
      expect(res.body).toHaveProperty('author');
      expect(res.body).toHaveProperty('requestId');
    });
  });

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

  describe('GET /quotes/:id', () => {
    it('should return a specific quote by ID', async () => {
      const res = await request(app).get('/quotes/1');
      
      expect(res. statusCode).toBe(200);
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

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const res = await request(app).get('/metrics');
      
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toContain('http_requests_total');
      expect(res.text).toContain('http_request_duration_seconds');
    });
  });

  describe('Invalid routes', () => {
    it('should return 404 for undefined routes', async () => {
      const res = await request(app).get('/invalid-route');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
    });
  });

  describe('Request Tracing', () => {
    it('should include X-Request-ID header in response', async () => {
      const res = await request(app).get('/quote');
      
      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should have matching requestId in header and body', async () => {
      const res = await request(app).get('/quote');
      
      expect(res.headers['x-request-id']).toBe(res.body.requestId);
    });
  });

  describe('Security Headers', () => {
    it('should include X-Content-Type-Options header', async () => {
      const res = await request(app).get('/');
      
      expect(res. headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const res = await request(app).get('/');
      
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('should include X-XSS-Protection header', async () => {
      const res = await request(app).get('/');
      
      expect(res.headers).toHaveProperty('x-xss-protection');
    });

    it('should not expose X-Powered-By header', async () => {
      const res = await request(app).get('/');
      
      expect(res. headers['x-powered-by']).toBeUndefined();
    });
  });

});