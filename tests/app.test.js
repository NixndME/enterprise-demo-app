const request = require('supertest');

describe('Enterprise Demo Application Tests', () => {
  let app;

  beforeAll(() => {
    // Set test environment
    process.env.APP_VERSION = 'v1.0.0-test';
    process.env.NODE_ENV = 'test';
    
    // Import app after setting environment
    app = require('../app.js');
  });

  test('should return main page', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.text).toContain('Enterprise Demo Application');
  });

  test('should return health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'healthy');
  });

  test('should return metrics', async () => {
    const response = await request(app)
      .get('/metrics')
      .expect(200);
    
    expect(response.text).toBeTruthy();
  });

  test('should not expose x-powered-by header', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});