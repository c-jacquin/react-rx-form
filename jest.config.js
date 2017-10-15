module.exports = {
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.test.{ts, tsx}',
        '!src/**/*.d.ts',
        '!src/**/types.ts',
        '!**/node_modules/**'
    ],
    coverageDirectory: '.temp',
    moduleDirectories: [
        'node_modules',
        'src'
    ],
    moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
    setupFiles: [
        './_scripts_/testHook/test-setup.js'
    ],
    testMatch: ['**/__tests__/*.(ts|tsx|js)'],
    testPathIgnorePatterns: [
        '<rootDir>/build/',
        '<rootDir>/node_modules/'
    ],
    transform: {
        '.(js|jsx)': '<rootDir>/node_modules/babel-jest',
        '.(ts|tsx)': '<rootDir>/node_modules/ts-jest/preprocessor.js'
    }
}
