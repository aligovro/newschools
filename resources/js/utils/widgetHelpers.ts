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

    // Затем из URL: /organization/1/... или /dashboard/organizations/1/...
    const match =
        window.location.pathname.match(/\/organization\/(\d+)/) ||
        window.location.pathname.match(/\/organizations\/(\d+)/);
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
        'school_hero',
        'school_subscribe',
        'slider',
        'form',
        'auth_menu',
        'image',
        'donation',
        'projects',
        'city_supporters',
        'donations_list',
        'referral_leaderboard',
        'alumni_stats',
        'html',
        'city_organizations',
        'projects_slider',
        'teachers_slider',
        'clubs',
        'club_schedule',
        'video_lessons',
        'subscribe_block',
        'add_organization_block',
        'organization_search',
        'top_donors',
        'top_recurring_donors',
        'org_top_donors',
        'org_top_recurring_donors',
        'org_donations_feed',
        'share_buttons',
    ];
    return customWidgets.includes(slug);
};

/**
 * Типы виджетов для безопасной работы
 */
export type WidgetSlug =
    | 'hero'
    | 'school_hero'
    | 'school_subscribe'
    | 'text'
    | 'gallery'
    | 'stats'
    | 'projects'
    | 'image'
    | 'menu'
    | 'slider'
    | 'form'
    | 'donation'
    | 'city_supporters'
    | 'donations_list'
    | 'referral_leaderboard'
    | 'html'
    | 'city_organizations'
    | 'projects_slider'
    | 'teachers_slider'
    | 'clubs'
    | 'club_schedule'
    | 'video_lessons'
    | 'top_donors'
    | 'top_recurring_donors'
    | 'org_top_donors'
    | 'org_top_recurring_donors'
    | 'org_donations_feed'
    | 'share_buttons';
