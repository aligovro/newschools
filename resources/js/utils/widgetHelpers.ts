/**
 * Вспомогательные функции для работы с виджетами
 */

/**
 * Получает ID организации из конфига виджета или URL
 */
export const getOrganizationId = (
    config?: Record<string, unknown>,
): number | undefined => {
    // Сначала пытаемся получить из конфига
    if (config?.organization_id) {
        return config.organization_id as number;
    }

    // Затем из URL (например, /organization/1/admin/sites/...)
    const match = window.location.pathname.match(/\/organization\/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
};

/**
 * Проверяет, является ли виджет кастомным (с собственным редактором)
 */
export const isCustomWidget = (slug: string): boolean => {
    const customWidgets = [
        'text',
        'menu',
        'hero',
        'form',
        'donation',
        'region_rating',
        'donations_list',
    ];
    return customWidgets.includes(slug);
};

/**
 * Типы виджетов для безопасной работы
 */
export type WidgetSlug =
    | 'hero'
    | 'text'
    | 'gallery'
    | 'stats'
    | 'projects'
    | 'image'
    | 'menu'
    | 'form'
    | 'donation'
    | 'region_rating'
    | 'donations_list';
