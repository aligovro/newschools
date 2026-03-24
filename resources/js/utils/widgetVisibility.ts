/**
 * Общая логика видимости виджетов/позиций по маршруту главного сайта и по slug/id страницы сайта организации.
 */

export type VisibilityRules = {
    mode?: 'all' | 'include' | 'exclude';
    routes?: string[];
    pages?: unknown[];
};

export function getCurrentRouteKey(): string | null {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname || '/';
    if (path === '/' || path === '') return 'home';
    if (path.startsWith('/organizations')) return 'organizations';
    if (path.startsWith('/organization/')) return 'organization_show';
    if (path.startsWith('/projects')) return 'projects';
    if (path.startsWith('/project/')) return 'project_show';
    return null;
}

function normalizeSlug(s: string): string {
    return s.replace(/^\/+/, '').trim();
}

function sameId(a: unknown, b: unknown): boolean {
    if (a == null || b == null) return false;
    return Number(a) === Number(b);
}

/**
 * Текущая страница входит в список rules.pages (по id или slug).
 * Пустой список — «нет фильтра по страницам».
 */
export function matchesPageVisibility(
    rules: VisibilityRules,
    page: { id?: number; slug?: string } | null | undefined,
): boolean {
    const pages = rules.pages;
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
        return true;
    }
    if (!page || (page.slug == null && page.id == null)) {
        return false;
    }
    return pages.some((raw) => {
        if (typeof raw === 'number') {
            return sameId(raw, page.id);
        }
        if (typeof raw === 'string') {
            const n = Number.parseInt(raw, 10);
            if (!Number.isNaN(n) && String(n) === String(raw).trim()) {
                return sameId(n, page.id);
            }
            const want = normalizeSlug(raw);
            const have = page.slug ? normalizeSlug(page.slug) : '';
            return want === have;
        }
        if (raw && typeof raw === 'object') {
            const o = raw as Record<string, unknown>;
            if (typeof o.slug === 'string') {
                return normalizeSlug(o.slug) === normalizeSlug(page.slug || '');
            }
            if (o.id != null) {
                return sameId(o.id, page.id);
            }
        }
        return false;
    });
}

/**
 * Видимость: режим «только выбранные» объединяет маршруты главного сайта и страницы CMS (логическое ИЛИ),
 * как в VisibilityPanel (две независимые группы чекбоксов).
 */
export function shouldShowByVisibilityRules(
    rules: VisibilityRules,
    page: { id?: number; slug?: string } | null | undefined,
): boolean {
    const mode = (rules.mode as 'all' | 'include' | 'exclude') || 'all';
    const routeKey = getCurrentRouteKey();
    const routes: string[] = rules.routes || [];
    const pages = rules.pages;
    const hasRouteFilter = routes.length > 0;
    const hasPageFilter = Array.isArray(pages) && pages.length > 0;

    if (mode === 'all') {
        return true;
    }

    const routeMatchesSelection =
        hasRouteFilter && routeKey != null && routes.includes(routeKey);
    const pageMatchesSelection =
        hasPageFilter && matchesPageVisibility(rules, page);

    if (mode === 'include') {
        if (!hasRouteFilter && !hasPageFilter) {
            return true;
        }
        if (hasRouteFilter && hasPageFilter) {
            return routeMatchesSelection || pageMatchesSelection;
        }
        if (hasRouteFilter) {
            return routeMatchesSelection;
        }
        return pageMatchesSelection;
    }

    if (mode === 'exclude') {
        if (!hasRouteFilter && !hasPageFilter) {
            return true;
        }
        if (hasRouteFilter && hasPageFilter) {
            return !(routeMatchesSelection || pageMatchesSelection);
        }
        if (hasRouteFilter) {
            return !routeMatchesSelection;
        }
        return !pageMatchesSelection;
    }

    return true;
}
