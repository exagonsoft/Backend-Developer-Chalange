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
    },
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],
    coveragePathIgnorePatterns: ["/node_modules/", "/tests/"]
};
