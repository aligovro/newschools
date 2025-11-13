// Константы приложения

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },
    USER: {
        PROFILE: '/user',
        UPDATE_PROFILE: '/user/profile',
        CHANGE_PASSWORD: '/user/change-password',
    },
    ORGANIZATIONS: {
        LIST: '/organizations',
        CREATE: '/organizations',
        SHOW: (id: number) => `/organizations/${id}`,
        UPDATE: (id: number) => `/organizations/${id}`,
        DELETE: (id: number) => `/organizations/${id}`,
    },
    PROJECTS: {
        LIST: '/projects',
        CREATE: '/projects',
        SHOW: (id: number) => `/projects/${id}`,
        UPDATE: (id: number) => `/projects/${id}`,
        DELETE: (id: number) => `/projects/${id}`,
    },
    DONATIONS: {
        LIST: '/donations',
        CREATE: '/donations',
        SHOW: (id: number) => `/donations/${id}`,
    },
    PAYMENTS: {
        METHODS: '/payment-methods',
        TRANSACTIONS: '/payment-transactions',
        CREATE: '/payments',
    },
} as const;

// Статусы
export const STATUSES = {
    PROJECT: {
        ACTIVE: 'active',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
    },
    DONATION: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
    },
    PAYMENT: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
        CANCELLED: 'cancelled',
    },
} as const;

// Типы уведомлений
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
} as const;

// Темы
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
} as const;

// Языки
export const LANGUAGES = {
    RU: 'ru',
    EN: 'en',
} as const;

// Типы платежных методов
export const PAYMENT_METHOD_TYPES = {
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer',
    DIGITAL_WALLET: 'digital_wallet',
} as const;

// Типы кредитных карт
export const CARD_TYPES = {
    VISA: 'visa',
    MASTERCARD: 'mastercard',
    AMERICAN_EXPRESS: 'american-express',
    DISCOVER: 'discover',
    DINERS_CLUB: 'diners-club',
    JCB: 'jcb',
    UNIONPAY: 'unionpay',
    MAESTRO: 'maestro',
} as const;

// Валюты
export const CURRENCIES = {
    RUB: 'RUB',
    USD: 'USD',
    EUR: 'EUR',
} as const;

export const CURRENCY_SYMBOLS = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
} as const;

// Лимиты
export const LIMITS = {
    MIN_DONATION: 1,
    MAX_DONATION: 1000000,
    MIN_PASSWORD_LENGTH: 8,
    MAX_NAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 255,
    MAX_MESSAGE_LENGTH: 500,
    MAX_DESCRIPTION_LENGTH: 1000,
} as const;

// Регулярные выражения
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    CARD_NUMBER: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
    CVV: /^\d{3,4}$/,
    EXPIRY_DATE: /^(0[1-9]|1[0-2])\/\d{2}$/,
} as const;

// Настройки по умолчанию
export const DEFAULT_SETTINGS = {
    THEME: THEMES.SYSTEM,
    LANGUAGE: LANGUAGES.RU,
    CURRENCY: CURRENCIES.RUB,
    ITEMS_PER_PAGE: 10,
    SIDEBAR_OPEN: true,
    NOTIFICATION_TIMEOUT: 5000,
} as const;

// Коды ошибок
export const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

// Сообщения об ошибках
export const ERROR_MESSAGES = {
    [ERROR_CODES.VALIDATION_ERROR]: 'Ошибка валидации данных',
    [ERROR_CODES.UNAUTHORIZED]: 'Необходима авторизация',
    [ERROR_CODES.FORBIDDEN]: 'Доступ запрещен',
    [ERROR_CODES.NOT_FOUND]: 'Ресурс не найден',
    [ERROR_CODES.SERVER_ERROR]: 'Внутренняя ошибка сервера',
    [ERROR_CODES.NETWORK_ERROR]: 'Ошибка сети',
    [ERROR_CODES.TIMEOUT_ERROR]: 'Превышено время ожидания',
    UNKNOWN_ERROR: 'Произошла неизвестная ошибка',
} as const;

// Локальное хранилище
export const STORAGE_KEYS = {
    TOKEN: 'token',
    THEME: 'theme',
    LANGUAGE: 'language',
    USER_PREFERENCES: 'user_preferences',
    CART: 'cart',
    RECENT_SEARCHES: 'recent_searches',
} as const;

// URL маршруты
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    ORGANIZATIONS: '/organizations',
    PROJECTS: '/projects',
    DONATIONS: '/donations',
    ABOUT: '/about',
    CONTACT: '/contact',
    HELP: '/help',
} as const;
