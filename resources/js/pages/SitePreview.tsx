import { WidgetDisplay } from '@/components/dashboard/site-builder/constructor/WidgetDisplay';
import type {
    WidgetPosition as SharedWidgetPosition,
    WidgetData,
} from '@/components/dashboard/site-builder/types';
import { widgetsSystemApi } from '@/lib/api/index';
import { buildSiteSeo } from '@/lib/seo';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import '../../css/site-preview.scss';

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    favicon?: string;
    template: string; // slug
    widgets_config: WidgetData[];
    seo_config: Record<string, unknown>;
    layout_config?: {
        sidebar_position?: 'left' | 'right';
    };
}

type WidgetPosition = SharedWidgetPosition;

type PositionVisibilityRules = {
    mode?: 'all' | 'include' | 'exclude';
    routes?: string[];
    pages?: unknown[];
};

interface SitePreviewProps {
    site: Site;
    positions?: WidgetPosition[];
    position_settings?: Array<{
        position_slug: string;
        visibility_rules?: PositionVisibilityRules;
        layout_overrides?: Record<string, unknown>;
    }>;
}

const SitePreview: React.FC<SitePreviewProps> = ({
    site,
    positions: ssrPositions,
    position_settings = [],
}) => {
    const [positions, setPositions] = useState<WidgetPosition[]>(
        ssrPositions || [],
    );
    const [loading, setLoading] = useState(
        !(ssrPositions && ssrPositions.length > 0),
    );

    // Загружаем позиции виджетов
    useEffect(() => {
        if (ssrPositions && ssrPositions.length > 0) {
            return;
        }
        const loadPositions = async () => {
            try {
                setLoading(true);
                const positionsData =
                    await widgetsSystemApi.getWidgetPositions();
                if (positionsData.success) {
                    setPositions(positionsData.data || []);
                }
            } catch (error) {
                console.error('Error loading positions:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPositions();
    }, [ssrPositions]);

    // Настройки позиций по slug
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

    // Группируем виджеты по позициям
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

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-gray-500">Загрузка...</div>
            </div>
        );
    }

    const renderPosition = (position: WidgetPosition) => {
        if (!shouldShowPosition(position)) return null;
        const positionWidgets = widgetsByPosition[position.slug] || [];

        return (
            <div
                key={position.id}
                className={`site-position site-position--${position.slug}`}
            >
                <div className="container mx-auto px-4">
                    {positionWidgets.length > 0 && (
                        <div className="space-y-4">
                            {positionWidgets.map((widget) => (
                                <div
                                    key={widget.id}
                                    className={`widget-container${widget.wrapper_class ? ` ${widget.wrapper_class}` : ''}`}
                                >
                                    <WidgetDisplay
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

    // SEO / Open Graph (общая логика из lib/seo)
    const currentUrl =
        typeof window !== 'undefined' ? window.location.href : undefined;
    const seoData = buildSiteSeo({
        siteName: site.name,
        siteDescription: site.description,
        rawSeo: (site.seo_config || {}) as Record<string, unknown>,
        currentUrl,
    });

    return (
        <>
            <Head title={seoData.title}>
                {site.favicon ? <link rel="icon" href={site.favicon} /> : null}
                <meta name="description" content={seoData.description} />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                {seoData.keywords && (
                    <meta name="keywords" content={seoData.keywords} />
                )}
                {seoData.canonicalUrl && (
                    <link rel="canonical" href={seoData.canonicalUrl} />
                )}
                {seoData.noindex && (
                    <meta name="robots" content="noindex,nofollow" />
                )}
                {/* Open Graph */}
                <meta property="og:type" content={seoData.ogType} />
                <meta property="og:title" content={seoData.ogTitle} />
                <meta
                    property="og:description"
                    content={seoData.ogDescription}
                />
                {seoData.canonicalUrl && (
                    <meta property="og:url" content={seoData.canonicalUrl} />
                )}
                {seoData.ogImage && (
                    <meta property="og:image" content={seoData.ogImage} />
                )}
                {/* Twitter */}
                <meta name="twitter:card" content={seoData.twitterCard} />
                <meta name="twitter:title" content={seoData.twitterTitle} />
                <meta
                    name="twitter:description"
                    content={seoData.twitterDescription}
                />
                {seoData.twitterImage && (
                    <meta name="twitter:image" content={seoData.twitterImage} />
                )}
                {/* JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: seoData.title,
                            description: seoData.description,
                            url: seoData.canonicalUrl,
                        }),
                    }}
                />
            </Head>

            <div className="site-preview">
                {/* Header: четыре колонки (header-col-1..4) сверху и полная ширина 'header' снизу */}
                <header className="site-header">
                    {(() => {
                        const headerColSlugs = [
                            'header-col-1',
                            'header-col-2',
                            'header-col-3',
                            'header-col-4',
                        ];
                        const headerCols = positions.filter(
                            (p) =>
                                p.area === 'header' &&
                                headerColSlugs.includes(p.slug),
                        );
                        const headerFull = positions.find(
                            (p) => p.area === 'header' && p.slug === 'header',
                        );

                        return (
                            <div className="space-y-6">
                                {headerCols.length > 0 && (
                                    <div className="container mx-auto px-4">
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            {headerCols.map((p) => (
                                                <div key={p.id}>
                                                    {renderPosition(p)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {headerFull && (
                                    <div>{renderPosition(headerFull)}</div>
                                )}
                                {!headerFull && headerCols.length === 0 && (
                                    <div>
                                        {positions
                                            .filter((p) => p.area === 'header')
                                            .map((p) => (
                                                <div key={p.id}>
                                                    {renderPosition(p)}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </header>

                {positions
                    .filter((p) => p.area === 'hero')
                    .map((position) => (
                        <section key={position.id} className="site-hero">
                            {renderPosition(position)}
                        </section>
                    ))}

                {/* Main Content */}
                <main className="site-main">
                    <div className="container mx-auto px-4 py-8">
                        {(() => {
                            // Проверяем есть ли видимые виджеты в видимых позициях сайдбара
                            const sidebarPositions = positions.filter(
                                (p) => p.area === 'sidebar',
                            );

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

                            // Получаем позицию сайдбара
                            const sidebarPosition =
                                site.layout_config?.sidebar_position || 'right';
                            const sidebarLeft = sidebarPosition === 'left';

                            // Если нет виджетов в сайдбаре, рендерим только content
                            if (!hasSidebarWidgets) {
                                return (
                                    <div className="grid grid-cols-1 gap-8">
                                        {positions
                                            .filter((p) => p.area === 'content')
                                            .map((position) => (
                                                <div
                                                    key={position.id}
                                                    className="site-content"
                                                >
                                                    {renderPosition(position)}
                                                </div>
                                            ))}
                                    </div>
                                );
                            }

                            // Рендерим с сайдбаром
                            const gridTemplateClass = sidebarLeft
                                ? 'lg:grid-cols-[minmax(360px,1fr)_repeat(3,minmax(0,1fr))]'
                                : 'lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(360px,1fr)]';

                            return (
                                <div
                                    className={`grid grid-cols-1 gap-8 lg:gap-24 ${gridTemplateClass}`}
                                >
                                    {/* Sidebar */}
                                    {sidebarLeft &&
                                        visibleSidebarPositions.map(
                                            (position) => (
                                                <aside
                                                    key={position.id}
                                                    className="lg:col-span-1"
                                                >
                                                    {renderPosition(position)}
                                                </aside>
                                            ),
                                        )}

                                    {/* Content */}
                                    <div className="lg:col-span-3">
                                        {positions
                                            .filter((p) => p.area === 'content')
                                            .map((position) => (
                                                <div
                                                    key={position.id}
                                                    className="site-content"
                                                >
                                                    {renderPosition(position)}
                                                </div>
                                            ))}
                                    </div>

                                    {/* Sidebar справа */}
                                    {!sidebarLeft &&
                                        visibleSidebarPositions.map(
                                            (position) => (
                                                <aside
                                                    key={position.id}
                                                    className="lg:col-span-1"
                                                >
                                                    {renderPosition(position)}
                                                </aside>
                                            ),
                                        )}
                                </div>
                            );
                        })()}
                    </div>
                </main>

                {/* Footer: четыре колонки (footer-col-1..4) и далее остальные позиции футера */}
                <footer className="site-footer">
                    {(() => {
                        const footerColSlugs = [
                            'footer-col-1',
                            'footer-col-2',
                            'footer-col-3',
                            'footer-col-4',
                        ];
                        const footerCols = positions.filter(
                            (p) =>
                                p.area === 'footer' &&
                                footerColSlugs.includes(p.slug),
                        );
                        const otherFooter = positions.filter(
                            (p) =>
                                p.area === 'footer' &&
                                !footerColSlugs.includes(p.slug),
                        );

                        return (
                            <div className="space-y-6">
                                {footerCols.length > 0 && (
                                    <div className="container mx-auto px-4">
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            {footerCols.map((p) => (
                                                <div key={p.id}>
                                                    {renderPosition(p)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {otherFooter.map((p) => (
                                    <div key={p.id}>{renderPosition(p)}</div>
                                ))}
                            </div>
                        );
                    })()}
                </footer>
            </div>
        </>
    );
};

export default SitePreview;
