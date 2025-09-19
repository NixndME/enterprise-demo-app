module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'app.js',
    '!node_modules/**',
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
};