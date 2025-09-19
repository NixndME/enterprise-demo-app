const express = require('express');
const promClient = require('prom-client');
const os = require('os');

const app = express();
app.disable('x-powered-by');
const port = 3000;

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'enterprise-demo-app',
  version: process.env.APP_VERSION || 'v1.0.0'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  registers: [register]
});

// Middleware for metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ 
      method: req.method, 
      route: req.route?.path || req.path, 
      status_code: res.statusCode 
    });
    httpRequestDuration.observe({ 
      method: req.method, 
      route: req.route?.path || req.path 
    }, duration);
  });
  
  next();
});

// Serve static files
app.use(express.static('public'));

// Main route
app.get('/', (req, res) => {
  const appVersion = process.env.APP_VERSION || 'v1.0.0';
  const nodeVersion = process.version;
  const hostname = os.hostname();
  const platform = os.platform();
  const uptime = Math.floor(process.uptime());
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Enterprise Demo Application</title>
        <style>
            body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
            }
            .container { 
                max-width: 800px; 
                margin: 0 auto; 
                text-align: center; 
                background: rgba(255,255,255,0.1);
                padding: 30px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            h1 { font-size: 2.5em; margin-bottom: 30px; }
            .version { 
                background: #ff6b6b; 
                padding: 10px 20px; 
                border-radius: 25px; 
                display: inline-block; 
                margin: 20px 0; 
                font-weight: bold;
                font-size: 1.2em;
            }
            .info-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 20px; 
                margin: 30px 0; 
            }
            .info-card { 
                background: rgba(255,255,255,0.2); 
                padding: 20px; 
                border-radius: 10px; 
            }
            .timestamp { margin-top: 30px; font-style: italic; opacity: 0.8; }
            .feature-new { 
                background: #4ecdc4; 
                padding: 15px; 
                border-radius: 10px; 
                margin: 20px 0; 
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            .domain { 
                background: #4ecdc4; 
                padding: 10px; 
                border-radius: 10px; 
                margin: 20px 0; 
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Enterprise Demo Application</h1>
            <div class="domain">Running on: init0xff.com</div>
            <div class="version">Version: ${appVersion}</div>
            
            <div class="info-grid">
                <div class="info-card">
                    <strong>Pod Hostname</strong><br>
                    ${hostname}
                </div>
                <div class="info-card">
                    <strong>Node Version</strong><br>
                    ${nodeVersion}
                </div>
                <div class="info-card">
                    <strong>Platform</strong><br>
                    ${platform}
                </div>
                <div class="info-card">
                    <strong>Uptime</strong><br>
                    ${uptime} seconds
                </div>
            </div>
            
            ${appVersion === 'v2.0.0' ? `
            <div class="feature-new">
                🎉 NEW FEATURE: Enhanced monitoring and better performance!
            </div>
            ` : ''}
            
            <div class="timestamp">
                Deployed at: ${new Date().toISOString()}
            </div>
            
            <div style="margin-top: 30px;">
                <p>📊 <a href="/metrics" style="color: #4ecdc4;">View Metrics</a></p>
                <p>🏥 <a href="/health" style="color: #4ecdc4;">Health Check</a></p>
                <p>⚡ <a href="/load-test" style="color: #4ecdc4;">Load Test</a></p>
            </div>
        </div>
        
        <script>
            // Simple analytics tracking for demo
            fetch('/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    screen: { width: screen.width, height: screen.height }
                })
            }).catch(() => {}); // Ignore errors for demo
        </script>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    version: process.env.APP_VERSION || 'v1.0.0',
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    uptime: process.uptime()
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Analytics endpoint (for demo purposes)
app.post('/analytics', express.json(), (req, res) => {
  console.log('Analytics data:', req.body);
  res.json({ received: true });
});

// Simulate some load for demo
app.get('/load-test', (req, res) => {
  const iterations = parseInt(req.query.iterations) || 1000;
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.random();
  }
  res.json({ 
    result, 
    iterations, 
    version: process.env.APP_VERSION || 'v1.0.0',
    hostname: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

// Error endpoint for testing
app.get('/error', (req, res) => {
  res.status(500).json({ 
    error: 'Simulated error for testing', 
    timestamp: new Date().toISOString() 
  });
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Enterprise Demo App running on port ${port}`);
    console.log(`Version: ${process.env.APP_VERSION || 'v1.0.0'}`);
    console.log(`Hostname: ${os.hostname()}`);
  });
}

module.exports = app;