// ❌ BAD EXAMPLES - These will FAIL security checks (for demo purposes)
// DO NOT COMMIT THESE TO PRODUCTION!

// Example 1: Hardcoded credentials (Will fail CI/CD)
const badConfig = {
  database: {
    host: 'localhost',
    username: 'admin',
    password: 'super_secret_password123', // ❌ This will be caught by security scan
    api_key: 'sk-1234567890abcdef'  // ❌ This will trigger secret detection
  },
  aws: {
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE', // ❌ AWS key pattern
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' // ❌ AWS secret
  },
  github: {
    token: 'ghp_1234567890abcdefghijklmnopqrstuvwxyz' // ❌ GitHub token pattern
  }
};

// Example 2: Vulnerable dependency (Will fail npm audit)
// In package.json, you can temporarily add: "lodash": "4.17.19" (has known vulnerabilities)

// Example 3: SQL Injection vulnerability (Will fail code analysis)
function badUserQuery(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`; // ❌ SQL injection risk
  return database.query(query);
}

// Example 4: Insecure randomness (Will fail security scan)
function generateWeakToken() {
  return Math.random().toString(36); // ❌ Not cryptographically secure
}

// Example 5: Hardcoded secrets in environment (Will be detected)
process.env.SECRET_KEY = 'hardcoded-secret-key-12345'; // ❌ Will be detected
process.env.JWT_SECRET = 'my-super-secret-jwt-key'; // ❌ Will be detected

// Example 6: Insecure HTTP requests (Will fail security scan)
const insecureConfig = {
  apiUrl: 'http://api.example.com', // ❌ Should use HTTPS
  allowInsecure: true // ❌ Insecure configuration
};

// Example 7: Command injection vulnerability
function executeCommand(userInput) {
  const cmd = `ls ${userInput}`; // ❌ Command injection risk
  require('child_process').exec(cmd);
}

// =============================================================================
// ✅ GOOD EXAMPLES - These will PASS security checks
// =============================================================================

// Example 1: Proper configuration management
const goodConfig = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD, // ✅ From environment variable
    ssl: process.env.NODE_ENV === 'production'
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // ✅ From environment
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY // ✅ From environment
  },
  github: {
    token: process.env.GITHUB_TOKEN // ✅ From environment
  }
};

// Example 2: Parameterized queries (SQL injection prevention)
function safeUserQuery(userId) {
  const query = 'SELECT * FROM users WHERE id = ?'; // ✅ Parameterized query
  return database.query(query, [userId]);
}

// Example 3: Secure random generation
const crypto = require('crypto');
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex'); // ✅ Cryptographically secure
}

// Example 4: Input validation and sanitization
function validateAndSanitizeInput(input) {
  // Input validation
  if (typeof input !== 'string' || input.length > 100) {
    throw new Error('Invalid input: must be string with max 100 characters');
  }
  
  // Sanitization
  return input
    .replace(/[<>]/g, '') // Basic XSS prevention
    .replace(/['"]/g, '') // SQL injection prevention
    .trim();
}

// Example 5: Security headers middleware
function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Force HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
}

// Example 6: Secure HTTP configuration
const secureConfig = {
  apiUrl: 'https://api.example.com', // ✅ HTTPS only
  timeout: 30000,
  validateCertificate: true, // ✅ Validate SSL certificates
  headers: {
    'User-Agent': 'Enterprise-Demo-App/1.0.0'
  }
};

// Example 7: Safe command execution
function safeCommandExecution(userInput) {
  // Whitelist allowed commands
  const allowedCommands = ['ls', 'pwd', 'whoami'];
  
  // Validate input
  if (!allowedCommands.includes(userInput.trim())) {
    throw new Error('Command not allowed');
  }
  
  // Use spawn instead of exec for better security
  const { spawn } = require('child_process');
  return spawn(userInput, [], { shell: false }); // ✅ No shell injection
}

// Example 8: Secure session management
const session = require('express-session');
const sessionConfig = {
  secret: process.env.SESSION_SECRET, // ✅ From environment
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only in production
    httpOnly: true, // ✅ Prevent XSS
    maxAge: 1000 * 60 * 60 * 24 // ✅ 24 hour expiry
  }
};

// Example 9: Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

// Example 10: Secure password hashing
const bcrypt = require('bcrypt');
async function hashPassword(password) {
  const saltRounds = 12; // ✅ Strong salt rounds
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Export good examples for use in application
module.exports = {
  goodConfig,
  safeUserQuery,
  generateSecureToken,
  validateAndSanitizeInput,
  securityHeaders,
  secureConfig,
  safeCommandExecution,
  sessionConfig,
  limiter,
  hashPassword,
  verifyPassword
};

// NOTE: The bad examples above are intentionally insecure and should NEVER be used in production
// They are only for demonstration purposes to show what the security pipeline will catch