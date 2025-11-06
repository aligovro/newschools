import { WidgetDisplay } from '@/components/dashboard/site-builder/constructor/WidgetDisplay';
import type {
    WidgetData,
    WidgetPosition,
} from '@/components/dashboard/site-builder/types';
import { Head } from '@inertiajs/react';
import React, { ReactNode } from 'react';
import '../../css/site-preview.scss';

interface MainLayoutProps {
    site: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        favicon?: string;
        template: string;
        site_type?: string;
        widgets_config: WidgetData[];
        seo_config?: Record<string, unknown>;
        layout_config?: {
            sidebar_position?: 'left' | 'right';
        };
    };
    positions: WidgetPosition[];
    position_settings?: Array<{
        position_slug: string;
        visibility_rules?: PositionVisibilityRules;
        layout_overrides?: Record<string, unknown>;
    }>;
    children?: ReactNode;
    pageTitle?: string;
    pageDescription?: string;
}

type PositionVisibilityRules = {
    mode?: 'all' | 'include' | 'exclude';
    routes?: string[];
    pages?: unknown[];
};

const MainLayout: React.FC<MainLayoutProps> = ({
    site,
    positions,
    position_settings = [],
    children,
    pageTitle,
    pageDescription,
}) => {
    const MemoWidgetDisplay = React.useMemo(
        () => React.memo(WidgetDisplay),
        [],
    );
    const settingsBySlug = React.useMemo(() => {
        const map: Record<
            string,
            {
                visibility_rules?: PositionVisibilityRules;
                layout_overrides?: Record<string, unknown>;
            }
        > = {};
        position_settings.forEach((s) => {
            map[s.position_slug] = {
                visibility_rules: s.visibility_rules || {},
                layout_overrides: s.layout_overrides || {},
            };
        });
        return map;
    }, [position_settings]);

    const getCurrentRouteKey = (): string | null => {
        if (typeof window === 'undefined') return null;
        const path = window.location.pathname || '/';
        if (path === '/' || path === '') return 'home';
        if (path.startsWith('/organizations')) return 'organizations';
        if (path.startsWith('/organization/')) return 'organization_show';
        if (path.startsWith('/projects')) return 'projects';
        if (path.startsWith('/project/')) return 'project_show';
        return null;
    };

    const isHomePage = (): boolean => {
        if (typeof window === 'undefined') return false;
        const path = window.location.pathname || '/';
        return path === '/' || path === '';
    };

    const getSitePreviewClasses = (): string => {
        const baseClasses = 'site-preview';
        const siteTypeClass = site.site_type
            ? ` site-type--${site.site_type}`
            : '';
        const templateClass = ` site-template--${site.template || 'default'}`;
        const pageTypeClass = isHomePage()
            ? ' page-type--home'
            : ' page-type--inner';
        return `${baseClasses}${siteTypeClass}${templateClass}${pageTypeClass}`;
    };

    const shouldShowPosition = (position: WidgetPosition): boolean => {
        const rules = settingsBySlug[position.slug]?.visibility_rules || {};
        const mode = (rules.mode as 'all' | 'include' | 'exclude') || 'all';
        const routeKey = getCurrentRouteKey();
        const routes: string[] = rules.routes || [];

        if (mode === 'all') return true;
        if (!routeKey) return mode === 'exclude';
        if (mode === 'include') return routes.includes(routeKey);
        if (mode === 'exclude') return !routes.includes(routeKey);
        return true;
    };

    const shouldShowWidget = (widget: WidgetData): boolean => {
        const rules =
            (widget.visibility_rules as PositionVisibilityRules) || {};
        const mode = (rules.mode as 'all' | 'include' | 'exclude') || 'all';
        const routeKey = getCurrentRouteKey();
        const routes: string[] = rules.routes || [];

        if (mode === 'all') return true;
        if (!routeKey) return mode === 'exclude';
        if (mode === 'include') return routes.includes(routeKey);
        if (mode === 'exclude') return !routes.includes(routeKey);
        return true;
    };

    const getLayoutFor = (
        position: WidgetPosition,
    ): { width: string; alignment: string } => {
        const base = (position.layout_config || {}) as Record<string, unknown>;
        const override = (settingsBySlug[position.slug]?.layout_overrides ||
            {}) as Record<string, unknown>;
        return {
            width:
                (override['width'] as string) ||
                (base['width'] as string) ||
                'full',
            alignment:
                (override['alignment'] as string) ||
                (base['alignment'] as string) ||
                'center',
        };
    };

    // Precompute widgets grouped by position with filtering/sorting
    const widgetsByPosition = React.useMemo(() => {
        const map: Record<string, WidgetData[]> = {};
        (site.widgets_config || []).forEach((w) => {
            if (!map[w.position_slug]) map[w.position_slug] = [];
            map[w.position_slug].push(w);
        });
        Object.keys(map).forEach((slug) => {
            map[slug] = map[slug]
                .filter((w) => w.is_active && w.is_visible)
                .sort((a, b) => a.order - b.order);
        });
        return map;
    }, [site.widgets_config]);

    // Precompute positions by areas to avoid repeated filtering
    const positionsByArea = React.useMemo(() => {
        const headerColSlugs = [
            'header-col-1',
            'header-col-2',
            'header-col-3',
            'header-col-4',
        ];
        const footerColSlugs = [
            'footer-col-1',
            'footer-col-2',
            'footer-col-3',
            'footer-col-4',
        ];
        return {
            headerCols: positions.filter(
                (p) => p.area === 'header' && headerColSlugs.includes(p.slug),
            ),
            headerFull:
                positions.find(
                    (p) => p.area === 'header' && p.slug === 'header',
                ) || null,
            headerAll: positions.filter((p) => p.area === 'header'),
            hero: positions.filter(
                (p) => p.area === 'hero' || p.slug === 'hero',
            ),
            sidebar: positions.filter((p) => p.area === 'sidebar'),
            content: positions.filter((p) => p.area === 'content'),
            footerCols: positions.filter(
                (p) => p.area === 'footer' && footerColSlugs.includes(p.slug),
            ),
            footerOther: positions.filter(
                (p) => p.area === 'footer' && !footerColSlugs.includes(p.slug),
            ),
        };
    }, [positions]);

    const renderPosition = (
        position: WidgetPosition,
        _widgets: WidgetData[],
    ) => {
        if (!shouldShowPosition(position)) return null;
        const positionWidgets = widgetsByPosition[position.slug] || [];

        const layout = getLayoutFor(position);
        const containerClass =
            layout.width === 'boxed' ? 'container mx-auto px-4' : '';
        const alignClass =
            layout.alignment === 'left'
                ? 'mx-0 ml-0'
                : layout.alignment === 'right'
                  ? 'ml-auto mr-0'
                  : 'mx-auto';

        return (
            <div
                key={position.id}
                className={`site-position site-position--${position.slug}`}
            >
                <div className={`${containerClass} ${alignClass}`}>
                    {positionWidgets.length > 0 && (
                        <div className="space-y-4">
                            {positionWidgets
                                .filter((widget) => shouldShowWidget(widget))
                                .map((widget) => (
                                    <div
                                        key={widget.id}
                                        className={`widget-container${widget.wrapper_class ? ` ${widget.wrapper_class}` : ''}`}
                                    >
                                        <MemoWidgetDisplay
                                            widget={widget}
                                            isEditable={false}
                                            useOutputRenderer={true}
                                        />
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // SEO
    const seo = (site.seo_config || {}) as Record<string, unknown>;
    const getString = (value: unknown): string | undefined =>
        typeof value === 'string' && value.trim() !== '' ? value : undefined;

    // Поддержка разных вариантов ключей для обратной совместимости
    const seoTitle =
        getString(seo['seo_title']) ||
        getString(seo['meta_title']) ||
        getString(seo['title']);
    const seoDescription =
        getString(seo['seo_description']) ||
        getString(seo['meta_description']) ||
        getString(seo['description']);
    const seoKeywords =
        getString(seo['seo_keywords']) ||
        getString(seo['meta_keywords']) ||
        getString(seo['keywords']);

    // Title: приоритет pageTitle > seo_title из настроек > site.name
    const metaTitle = pageTitle || seoTitle || site.name;

    // Description: приоритет pageDescription > seo_description из настроек > site.description
    const metaDescription =
        pageDescription || seoDescription || site.description || '';

    // Canonical URL
    const canonicalUrl: string | undefined =
        getString(seo['canonical_url']) ||
        getString(seo['slug_url']) ||
        (typeof window !== 'undefined' ? window.location.href : undefined);

    // Open Graph данные
    const ogTitle = getString(seo['og_title']) || seoTitle || metaTitle;
    const ogDescription =
        getString(seo['og_description']) || seoDescription || metaDescription;
    const ogType = getString(seo['og_type']) || 'website';
    const ogImage =
        getString(seo['og_image']) || getString(seo['image']) || undefined;

    // Twitter данные
    const twitterCard = getString(seo['twitter_card']) || 'summary_large_image';
    const twitterTitle =
        getString(seo['twitter_title']) || ogTitle || metaTitle;
    const twitterDescription =
        getString(seo['twitter_description']) ||
        ogDescription ||
        metaDescription;
    const twitterImage =
        getString(seo['twitter_image']) || ogImage || undefined;

    return (
        <>
            <Head title={metaTitle}>
                {site.favicon ? <link rel="icon" href={site.favicon} /> : null}
                <meta name="description" content={metaDescription} />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                {seoKeywords && <meta name="keywords" content={seoKeywords} />}
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
                {/* Open Graph */}
                <meta property="og:type" content={ogType} />
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content={ogDescription} />
                {canonicalUrl && (
                    <meta property="og:url" content={canonicalUrl} />
                )}
                {ogImage && <meta property="og:image" content={ogImage} />}
                {/* Twitter */}
                <meta name="twitter:card" content={twitterCard} />
                <meta name="twitter:title" content={twitterTitle} />
                <meta name="twitter:description" content={twitterDescription} />
                {twitterImage && (
                    <meta name="twitter:image" content={twitterImage} />
                )}
            </Head>

            <div className={getSitePreviewClasses()}>
                {/* Header: четыре колонки (header-col-1..4) */}
                <header className="site-header">
                    {(() => {
                        const { headerCols, headerFull, headerAll } =
                            positionsByArea;

                        return (
                            <div className="space-y-6">
                                {headerCols.length > 0 && (
                                    <div className="container mx-auto px-4">
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            {headerCols.map((p) => (
                                                <div key={p.id}>
                                                    {renderPosition(
                                                        p,
                                                        site.widgets_config,
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {headerFull && (
                                    <div>
                                        {renderPosition(
                                            headerFull,
                                            site.widgets_config,
                                        )}
                                    </div>
                                )}
                                {!headerFull && headerCols.length === 0 && (
                                    <div>
                                        {headerAll.map((p) => (
                                            <div key={p.id}>
                                                {renderPosition(
                                                    p,
                                                    site.widgets_config,
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </header>

                {positionsByArea.hero.map((position) => (
                    <section key={position.id} className="site-hero">
                        {renderPosition(position, site.widgets_config)}
                    </section>
                ))}

                {/* Main Content */}
                <main className="site-main">
                    <div className="container mx-auto px-4">
                        {(() => {
                            const sidebarPositions = positionsByArea.sidebar;

                            // Проверяем, есть ли видимые виджеты в видимых позициях сайдбара
                            const visibleSidebarPositions =
                                sidebarPositions.filter((position) =>
                                    shouldShowPosition(position),
                                );

                            const hasSidebarWidgets =
                                visibleSidebarPositions.some((position) => {
                                    const positionWidgets =
                                        widgetsByPosition[position.slug] || [];
                                    return positionWidgets.length > 0;
                                });

                            // Получаем позицию сайдбара из layout_config
                            const sidebarPosition =
                                site.layout_config?.sidebar_position || 'right';
                            const sidebarLeft = sidebarPosition === 'left';

                            if (!hasSidebarWidgets) {
                                return (
                                    <div className="grid grid-cols-1 gap-8">
                                        {children}
                                        {positionsByArea.content.map(
                                            (position) => (
                                                <div
                                                    key={position.id}
                                                    className="site-content"
                                                >
                                                    {renderPosition(
                                                        position,
                                                        site.widgets_config,
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                                    {sidebarLeft &&
                                        visibleSidebarPositions.map(
                                            (position) => (
                                                <aside
                                                    key={position.id}
                                                    className="lg:col-span-1"
                                                >
                                                    {renderPosition(
                                                        position,
                                                        site.widgets_config,
                                                    )}
                                                </aside>
                                            ),
                                        )}

                                    <div className="lg:col-span-3">
                                        {children}
                                        {positionsByArea.content.map(
                                            (position) => (
                                                <div
                                                    key={position.id}
                                                    className="site-content"
                                                >
                                                    {renderPosition(
                                                        position,
                                                        site.widgets_config,
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    {!sidebarLeft &&
                                        visibleSidebarPositions.map(
                                            (position) => (
                                                <aside
                                                    key={position.id}
                                                    className="lg:col-span-1"
                                                >
                                                    {renderPosition(
                                                        position,
                                                        site.widgets_config,
                                                    )}
                                                </aside>
                                            ),
                                        )}
                                </div>
                            );
                        })()}
                    </div>
                </main>

                {/* Footer: четыре колонки (footer-col-1..4) */}
                <footer className="site-footer">
                    {(() => {
                        const { footerCols, footerOther } = positionsByArea;

                        return (
                            <div className="footer-container">
                                {footerCols.length > 0 && (
                                    <div className="container mx-auto px-4">
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            {footerCols.map((p) => (
                                                <div key={p.id}>
                                                    {renderPosition(
                                                        p,
                                                        site.widgets_config,
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {footerOther.map((p) => (
                                    <div key={p.id}>
                                        {renderPosition(p, site.widgets_config)}
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </footer>
            </div>
        </>
    );
};

export default MainLayout;
