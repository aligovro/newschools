/**
 * Конфигурация категорий виджетов для конструктора сайтов
 */

export interface WidgetCategory {
    key: string;
    name: string;
    icon: string;
    description: string;
    position?: string; // Привязка к позиции
    order: number;
}

export const WIDGET_CATEGORIES: Record<string, WidgetCategory> = {
    header: {
        key: 'header',
        name: 'Шапка сайта',
        icon: '📌',
        description: 'Меню навигации, логотип',
        position: 'header',
        order: 1,
    },
    hero: {
        key: 'hero',
        name: 'Баннеры',
        icon: '🎯',
        description: 'Hero секции и слайдеры',
        position: 'hero',
        order: 2,
    },
    content: {
        key: 'content',
        name: 'Контент',
        icon: '📝',
        description: 'Текстовые блоки, проекты',
        position: 'content',
        order: 3,
    },
    media: {
        key: 'media',
        name: 'Медиа',
        icon: '🖼️',
        description: 'Изображения и галереи',
        position: 'content',
        order: 4,
    },
    forms: {
        key: 'forms',
        name: 'Формы',
        icon: '📋',
        description: 'Формы обратной связи, контакты',
        position: 'content',
        order: 5,
    },
    payment: {
        key: 'payment',
        name: 'Платежи',
        icon: '💳',
        description: 'Виджеты пожертвований и оплаты',
        position: 'content',
        order: 6,
    },
    navigation: {
        key: 'navigation',
        name: 'Навигация',
        icon: '🧭',
        description: 'Меню и навигационные элементы',
        position: 'header',
        order: 7,
    },
    footer: {
        key: 'footer',
        name: 'Подвал',
        icon: '📍',
        description: 'Виджеты для подвала сайта',
        position: 'footer',
        order: 8,
    },
};

/**
 * Получить категории для конкретной позиции
 */
export const getCategoriesForPosition = (
    positionSlug: string,
): WidgetCategory[] => {
    return Object.values(WIDGET_CATEGORIES)
        .filter((cat) => cat.position === positionSlug || !cat.position)
        .sort((a, b) => a.order - b.order);
};

/**
 * Получить иконку категории
 */
export const getCategoryIcon = (categoryKey: string): string => {
    return WIDGET_CATEGORIES[categoryKey]?.icon || '🔧';
};

/**
 * Получить название категории
 */
export const getCategoryName = (categoryKey: string): string => {
    return WIDGET_CATEGORIES[categoryKey]?.name || categoryKey;
};

/**
 * Упорядоченный список всех категорий
 */
export const getOrderedCategories = (): WidgetCategory[] => {
    return Object.values(WIDGET_CATEGORIES).sort((a, b) => a.order - b.order);
};
