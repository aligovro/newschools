/**
 * Структура layout_config.about для страницы «О школе» (шаблон school + about).
 */

export type AboutAnchorItem = {
    id: string;
    label: string;
};

export type AboutMissionBlock = {
    title?: string;
    body?: string;
    image?: string;
    imagePosition?: 'left' | 'right';
};

export type AboutValueCard = {
    title: string;
    body?: string;
};

export type AboutPageLayoutConfig = {
    anchorNav?: AboutAnchorItem[];
    mission?: AboutMissionBlock;
    values?: AboutValueCard[];
};

export const DEFAULT_ABOUT_ANCHORS: AboutAnchorItem[] = [
    { id: 'mission', label: 'Миссия' },
    { id: 'values', label: 'Ценности' },
    { id: 'activity', label: 'Деятельность' },
    { id: 'teachers', label: 'Преподаватели' },
    { id: 'partners', label: 'Партнеры' },
];

const EMPTY_MISSION: AboutMissionBlock = {
    title: '',
    body: '',
    image: '',
    imagePosition: 'left',
};

export function getAboutLayout(
    layoutConfig: Record<string, unknown> | null | undefined,
): AboutPageLayoutConfig | null {
    const raw = layoutConfig?.about;
    if (!raw || typeof raw !== 'object') return null;
    return raw as AboutPageLayoutConfig;
}

/**
 * Для страницы school + about: данные из БД + дефолты для mission/values,
 * чтобы безопасно читать imagePosition и т.д. Не подменяет сохранённый about в CMS.
 */
export function getAboutLayoutForPage(
    layoutConfig: Record<string, unknown> | null | undefined,
    options: { isSchoolAbout: boolean },
): AboutPageLayoutConfig | null {
    if (!options.isSchoolAbout) return null;
    const stored = getAboutLayout(layoutConfig);
    if (stored) {
        return {
            ...stored,
            mission: {
                ...EMPTY_MISSION,
                ...stored.mission,
            },
            values: Array.isArray(stored.values) ? stored.values : [],
        };
    }
    return {
        mission: { ...EMPTY_MISSION },
        values: [],
    };
}

export function resolveAboutAnchors(
    about: AboutPageLayoutConfig | null,
): AboutAnchorItem[] {
    const nav = about?.anchorNav;
    if (Array.isArray(nav) && nav.length > 0) {
        return nav.filter(
            (i) =>
                i &&
                typeof i.id === 'string' &&
                i.id.length > 0 &&
                typeof i.label === 'string',
        ) as AboutAnchorItem[];
    }
    return DEFAULT_ABOUT_ANCHORS;
}
