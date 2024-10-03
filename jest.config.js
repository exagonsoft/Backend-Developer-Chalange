module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    setupFilesAfterEnv: ['./tests/setup.ts'],
    globals: {
      "ts-jest": {
        "diagnostics": {
          "warnOnly": true
        }
      }
    }
};
