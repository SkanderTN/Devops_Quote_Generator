module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
  testMatch: ['**/tests/**/*.test.js'],
  detectOpenHandles: true,
  forceExit: true
};
