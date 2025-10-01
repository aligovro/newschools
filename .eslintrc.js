module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint', 'react-hooks'],
    rules: {
        // Разрешаем any в определенных случаях
        '@typescript-eslint/no-explicit-any': [
            'error',
            {
                ignoreRestArgs: true, // Разрешаем any в rest параметрах
            },
        ],

        // Разрешаем any для внешних API и конфигураций
        '@typescript-eslint/no-explicit-any': 'off',

        // Предупреждения вместо ошибок для некоторых правил
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],

        // React правила
        'react/react-in-jsx-scope': 'off', // Не нужно импортировать React в каждом файле
        'react/prop-types': 'off', // Используем TypeScript для типизации пропсов

        // Общие правила
        'no-console': 'warn', // Предупреждение вместо ошибки для console
        'prefer-const': 'warn',
        'no-var': 'error',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    overrides: [
        {
            // Разрешаем any в файлах типов
            files: ['**/*.d.ts', '**/types/**/*.ts'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
            },
        },
        {
            // Разрешаем any в конфигурационных файлах
            files: ['**/config/**/*.ts', '**/config/**/*.js'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
            },
        },
    ],
};
