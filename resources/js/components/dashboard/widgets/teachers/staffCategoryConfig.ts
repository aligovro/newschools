/**
 * Конфигурация категорий преподавателей для фильтра.
 * Сопоставление должности (position) с категорией по ключевым словам.
 */
export interface StaffCategoryConfig {
    slug: string;
    label: string;
    keywords: string[];
}

export const STAFF_CATEGORIES: StaffCategoryConfig[] = [
    { slug: 'natural', label: 'Естественные науки', keywords: ['биолог', 'химия', 'естествен', 'природ'] },
    { slug: 'foreign', label: 'Иностранный язык', keywords: ['английск', 'иностран', 'немецк', 'французск'] },
    { slug: 'math', label: 'Математические', keywords: ['математ', 'алгебр', 'геометри'] },
    { slug: 'russian', label: 'Русский язык', keywords: ['русск', 'литератур'] },
    { slug: 'tatar', label: 'Татарский язык', keywords: ['татарск'] },
    { slug: 'history', label: 'История', keywords: ['истори', 'обществознан'] },
    { slug: 'sport', label: 'Физкультура', keywords: ['физкультур', 'спорт', 'физкульт'] },
    { slug: 'art', label: 'ИЗО и творчество', keywords: ['изо', 'рисовани', 'арт', 'творчеств'] },
];

/**
 * Определяет slug категории по должности (первое совпадение).
 */
export function getCategorySlugForPosition(position: string | null | undefined): string | null {
    if (!position || typeof position !== 'string') return null;
    const lower = position.toLowerCase().trim();
    for (const cat of STAFF_CATEGORIES) {
        if (cat.keywords.some((kw) => lower.includes(kw))) return cat.slug;
    }
    return null;
}

/**
 * Строит список категорий с количеством преподавателей.
 * Возвращает только категории, у которых count > 0.
 */
export function buildCategoriesWithCounts(
    staff: Array<{ position?: string | null }>,
): Array<{ slug: string; label: string; count: number }> {
    const counts = new Map<string, number>();
    for (const cat of STAFF_CATEGORIES) {
        counts.set(cat.slug, 0);
    }
    for (const s of staff) {
        const slug = getCategorySlugForPosition(s.position);
        if (slug && counts.has(slug)) {
            counts.set(slug, (counts.get(slug) ?? 0) + 1);
        }
    }
    return STAFF_CATEGORIES
        .filter((c) => (counts.get(c.slug) ?? 0) > 0)
        .map((c) => ({ slug: c.slug, label: c.label, count: counts.get(c.slug) ?? 0 }));
}

/**
 * Фильтрует преподавателей по slug категории.
 * '' = все, иначе только те, чья должность попадает в категорию.
 */
export function filterStaffByCategory<T extends { position?: string | null }>(
    staff: T[],
    categorySlug: string,
): T[] {
    if (!categorySlug) return staff;
    return staff.filter((s) => getCategorySlugForPosition(s.position) === categorySlug);
}
