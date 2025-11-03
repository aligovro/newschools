/**
 * Утилиты для работы со ссылками и определения их типа
 */

/**
 * Определяет, является ли ссылка внутренней (для использования с Inertia)
 * @param url - URL для проверки
 * @returns true если ссылка внутренняя, false если внешняя
 */
export const isInternalLink = (url: string): boolean => {
    if (!url || url.trim() === '') return false;

    // Якоря и пустые ссылки считаем внутренними
    if (url.startsWith('#') || url === '') return true;

    try {
        // Если URL начинается с /, это внутренняя ссылка
        if (url.startsWith('/')) return true;

        // Пытаемся распарсить как полный URL
        const urlObj = new URL(url, window.location.origin);

        // Проверяем, совпадает ли origin с текущим
        return urlObj.origin === window.location.origin;
    } catch {
        // Если не удалось распарсить, считаем внутренней (относительный путь)
        return true;
    }
};

/**
 * Нормализует URL для использования с Inertia Link
 * Добавляет / в начало если отсутствует для относительных путей
 * @param url - URL для нормализации
 * @returns нормализованный URL
 */
export const normalizeInternalUrl = (url: string): string => {
    if (!url || url.trim() === '') return '/';

    // Если начинается с /, возвращаем как есть
    if (url.startsWith('/')) return url;

    // Если это полный URL с протоколом, возвращаем как есть
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Добавляем / в начало для относительных путей
    return `/${url}`;
};
