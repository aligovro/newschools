import * as cardValidator from 'card-validator';
import clsx, { type ClassValue } from 'clsx';
import creditCardType from 'credit-card-type';
import { format, isValid, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// Утилиты для работы с классами CSS
export const cn = (...inputs: ClassValue[]) => {
    return clsx(inputs);
};

// Утилиты для работы с датами
export const formatDate = (
    date: string | Date,
    formatStr: string = 'dd.MM.yyyy',
): string => {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) {
            return 'Неверная дата';
        }
        return format(dateObj, formatStr, { locale: ru });
    } catch {
        return 'Неверная дата';
    }
};

export const formatDateTime = (date: string | Date): string => {
    return formatDate(date, 'dd.MM.yyyy HH:mm');
};

export const formatTime = (date: string | Date): string => {
    return formatDate(date, 'HH:mm');
};

// Утилиты для работы с кредитными картами
export const getCardType = (cardNumber: string): string | null => {
    const types = creditCardType(cardNumber);
    return types.length > 0 ? types[0].type : null;
};

export const isValidCardNumber = (cardNumber: string): boolean => {
    return cardValidator.number(cardNumber).isValid;
};

export const formatCardNumber = (cardNumber: string): string => {
    // Удаляем все нецифровые символы
    const cleaned = cardNumber.replace(/\D/g, '');

    // Добавляем пробелы каждые 4 цифры
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

export const formatExpiryDate = (expiryDate: string): string => {
    // Удаляем все нецифровые символы
    const cleaned = expiryDate.replace(/\D/g, '');

    // Добавляем слеш после 2 цифр
    if (cleaned.length >= 2) {
        return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }

    return cleaned;
};

// Утилиты для форматирования чисел и валют
export const formatCurrency = (
    amount: number,
    currency: string = 'RUB',
): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatNumber = (number: number): string => {
    return new Intl.NumberFormat('ru-RU').format(number);
};

/**
 * Получить правильную форму слова для числа (склонение)
 * @param count - число
 * @param forms - массив из 3 форм: [форма для 1, форма для 2-4, форма для 5+]
 * @returns правильная форма слова
 * 
 * Примеры:
 * - getPluralForm(1, ['школа', 'школы', 'школ']) => 'школа'
 * - getPluralForm(2, ['школа', 'школы', 'школ']) => 'школы'
 * - getPluralForm(5, ['школа', 'школы', 'школ']) => 'школ'
 */
export const getPluralForm = (count: number, forms: [string, string, string]): string => {
    const cases = [2, 0, 1, 1, 1, 2];
    const caseIndex = (count % 100 > 4 && count % 100 < 20) 
        ? 2 
        : cases[Math.min(count % 10, 5)];
    
    return forms[caseIndex] || forms[1];
};

// Утилиты для работы со строками
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Удаляем специальные символы
        .replace(/[\s_-]+/g, '-') // Заменяем пробелы и подчеркивания на дефисы
        .replace(/^-+|-+$/g, ''); // Удаляем дефисы в начале и конце
};

// Утилиты для работы с файлами
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Байт';

    const k = 1024;
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// Утилиты для работы с URL
export const isValidUrl = (string: string): boolean => {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
};

export const getDomainFromUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return '';
    }
};

// Утилиты для работы с локальным хранилищем
export const setLocalStorage = (key: string, value: unknown): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
    }
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Ошибка чтения из localStorage:', error);
        return defaultValue;
    }
};

export const removeLocalStorage = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Ошибка удаления из localStorage:', error);
    }
};

// Утилиты для работы с debounce
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number,
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
};

// Утилиты для генерации случайных значений
export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

export const generateRandomString = (length: number): string => {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
