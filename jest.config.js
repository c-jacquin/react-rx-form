module.exports = {
    collectCoverageFrom: [
        'src/hoc/**/*.{ts,tsx}',
        '!src/**/*.test.{ts, tsx}',
        '!src/**/*.d.ts',
        '!src/**/types.ts',
        '!**/node_modules/**'
    ],
    coverageDirectory: '.temp',
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        },
    },
    moduleDirectories: [
        'node_modules',
        'src'
    ],
    moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
    setupFiles: [
        'raf/polyfill',        
        './_scripts_/test/test-setup.js'
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
