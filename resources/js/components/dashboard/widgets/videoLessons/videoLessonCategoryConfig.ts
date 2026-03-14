/**
 * Конфигурация категорий видео-уроков для фильтра.
 * Сопоставление title/description с категорией по ключевым словам.
 */
export interface VideoLessonCategoryConfig {
    slug: string;
    label: string;
    keywords: string[];
}

export const VIDEO_LESSON_CATEGORIES: VideoLessonCategoryConfig[] = [
    { slug: 'natural', label: 'Естественные науки', keywords: ['биолог', 'химия', 'физик', 'естествен', 'природ'] },
    { slug: 'foreign', label: 'Иностранный язык', keywords: ['английск', 'иностран', 'немецк', 'французск'] },
    { slug: 'math', label: 'Математические', keywords: ['математ', 'алгебр', 'геометри'] },
    { slug: 'russian', label: 'Русский язык', keywords: ['русск', 'литератур', 'орфограф', 'пунктуаци'] },
    { slug: 'tatar', label: 'Татарский язык', keywords: ['татарск'] },
    { slug: 'history', label: 'История', keywords: ['истори', 'обществознан'] },
    { slug: 'education', label: 'Воспитание', keywords: ['воспитани', 'психолог', 'педагог', 'егэ', 'огэ'] },
];

/**
 * Определяет slug категории по title/description (первое совпадение).
 */
export function getCategorySlugForVideoLesson(
    title: string | null | undefined,
    description?: string | null,
): string | null {
    const text = [title, description].filter(Boolean).join(' ').toLowerCase().trim();
    if (!text) return null;
    for (const cat of VIDEO_LESSON_CATEGORIES) {
        if (cat.keywords.some((kw) => text.includes(kw))) return cat.slug;
    }
    return null;
}

/**
 * Получить label категории по slug.
 */
export function getCategoryLabel(slug: string): string {
    const cat = VIDEO_LESSON_CATEGORIES.find((c) => c.slug === slug);
    return cat?.label ?? 'Другое';
}

/**
 * Строит список категорий с количеством видео.
 */
export function buildVideoCategoriesWithCounts(
    lessons: Array<{ title?: string | null; description?: string | null }>,
): Array<{ slug: string; label: string; count: number }> {
    const counts = new Map<string, number>();
    for (const cat of VIDEO_LESSON_CATEGORIES) {
        counts.set(cat.slug, 0);
    }
    for (const v of lessons) {
        const slug = getCategorySlugForVideoLesson(v.title, v.description);
        if (slug && counts.has(slug)) {
            counts.set(slug, (counts.get(slug) ?? 0) + 1);
        }
    }
    return VIDEO_LESSON_CATEGORIES
        .filter((c) => (counts.get(c.slug) ?? 0) > 0)
        .map((c) => ({ slug: c.slug, label: c.label, count: counts.get(c.slug) ?? 0 }));
}

/**
 * Фильтрует видео по slug категории.
 */
export function filterVideoLessonsByCategory<T extends { title?: string | null; description?: string | null }>(
    lessons: T[],
    categorySlug: string,
): T[] {
    if (!categorySlug) return lessons;
    return lessons.filter(
        (v) => getCategorySlugForVideoLesson(v.title, v.description) === categorySlug,
    );
}
