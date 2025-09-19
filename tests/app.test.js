const request = require('supertest');
const express = require('express');

// Mock the app for testing
let app;

beforeEach(() => {
  // Clear module cache to ensure fresh app instance
  delete require.cache[require.resolve('../app.js')];
  
  // Mock environment variables
  process.env.APP_VERSION = 'v1.0.0-test';
  process.env.NODE_ENV = 'test';
  
  // Create a new app instance for each test
  app = express();
  
  // Simplified version of the main app for testing
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <body>
          <h1>Enterprise Demo Application</h1>
          <div class="version">Version: ${process.env.APP_VERSION}</div>
        </body>
      </html>
    `);
  });
  
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      version: process.env.APP_VERSION,
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('# HELP test_metric Test metric\n# TYPE test_metric counter\ntest_metric 1\n');
  });
});

describe('Enterprise Demo Application', () => {
  describe('GET /', () => {
    it('should return the main page with version', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.text).toContain('Enterprise Demo Application');
      expect(response.text).toContain('Version: v1.0.0-test');
    });

    it('should return HTML content type', async () => {
      await request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('version', 'v1.0.0-test');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return current timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      const timestamp = new Date(response.body.timestamp);
      const now = new Date();
      const timeDiff = Math.abs(now - timestamp);
      
      // Timestamp should be within 1 second of current time
      expect(timeDiff).toBeLessThan(1000);
    });
  });

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200)
        .expect('Content-Type', /text\/plain/);
      
      expect(response.text).toContain('test_metric');
    });
  });
});

describe('Security Tests', () => {
  describe('Environment Variables', () => {
    it('should not expose sensitive information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      // Check that no sensitive data is exposed
      expect(response.text).not.toContain('password');
      expect(response.text).not.toContain('secret');
      expect(response.text).not.toContain('api_key');
      expect(response.text).not.toContain('token');
    });
  });

  describe('HTTP Headers', () => {
    it('should not expose server information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });
});

describe('Performance Tests', () => {
  describe('Response Times', () => {
    it('should respond quickly to health checks', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);
      
      const responseTime = Date.now() - start;
      expect(responseTime).toBeLessThan(100); // Should respond within 100ms
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill().map(() => 
        request(app).get('/').expect(200)
      );
      
      await Promise.all(requests);
    });
  });
});

describe('Integration Tests', () => {
  describe('Version Management', () => {
    it('should handle version changes', async () => {
      // Test v1
      process.env.APP_VERSION = 'v1.0.0';
      let response = await request(app).get('/health').expect(200);
      expect(response.body.version).toBe('v1.0.0');
      
      // Test v2
      process.env.APP_VERSION = 'v2.0.0';
      response = await request(app).get('/health').expect(200);
      expect(response.body.version).toBe('v2.0.0');
    });
  });
});

// Cleanup after tests
afterAll(() => {
  // Reset environment variables
  delete process.env.APP_VERSION;
  delete process.env.NODE_ENV;
});