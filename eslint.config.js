module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true,
    },
    extends: [
        'airbnb-base', // Or 'standard', 'google', etc.
        'plugin:jest/recommended',
        'plugin:node/recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        'jest',
        'node',
    ],
    rules: {
        'no-console': 'warn',
        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-missing-import': 'off',
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
};
