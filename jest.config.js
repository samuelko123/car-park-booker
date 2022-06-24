const nextJest = require('next/jest')

const createJestConfig = nextJest({
	dir: './',
})

const customJestConfig = {
	collectCoverage: true,
	globalSetup: '<rootDir>/tests/fixtures/global-setup.js',
	globalTeardown: '<rootDir>/tests/fixtures/global-teardown.js',
	maxWorkers: '50%',
	restoreMocks: true,
	setupFilesAfterEnv: ['<rootDir>/tests/fixtures/setup-after-env.js'],
	testEnvironment: 'node',
	testMatch: ['<rootDir>/tests/**/*.test.js'],
}

module.exports = createJestConfig(customJestConfig)