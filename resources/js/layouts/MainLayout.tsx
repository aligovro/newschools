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
        widgets_config: WidgetData[];
        seo_config?: Record<string, unknown>;
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
            layout.width === 'boxed' ? 'container mx-auto px-4' : 'px-4';
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
                            {positionWidgets.map((widget) => (
                                <div
                                    key={widget.id}
                                    className="widget-container"
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

    const metaTitle = pageTitle || getString(seo['title']) || site.name;
    const metaDescription =
        pageDescription ||
        getString(seo['description']) ||
        site.description ||
        '';
    const metaKeywords: string | undefined = getString(seo['keywords']);
    const canonicalUrl: string | undefined =
        getString(seo['canonical_url']) ||
        getString(seo['slug_url']) ||
        (typeof window !== 'undefined' ? window.location.href : undefined);
    const ogImage: string | undefined =
        getString(seo['og_image']) || getString(seo['image']);

    return (
        <>
            <Head>
                <title>{metaTitle}</title>
                {site.favicon ? <link rel="icon" href={site.favicon} /> : null}
                <meta name="description" content={metaDescription} />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                {metaKeywords && (
                    <meta name="keywords" content={metaKeywords} />
                )}
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDescription} />
                {canonicalUrl && (
                    <meta property="og:url" content={canonicalUrl} />
                )}
                {ogImage && <meta property="og:image" content={ogImage} />}
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metaTitle} />
                <meta name="twitter:description" content={metaDescription} />
                {ogImage && <meta name="twitter:image" content={ogImage} />}
            </Head>

            <div className="site-preview">
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
                    <div className="container mx-auto px-4 py-8">
                        {(() => {
                            const sidebarPositions = positionsByArea.sidebar;
                            const hasSidebarWidgets = sidebarPositions.some(
                                (position) =>
                                    site.widgets_config.some(
                                        (widget) =>
                                            widget.position_slug ===
                                                position.slug &&
                                            widget.is_active &&
                                            widget.is_visible,
                                    ),
                            );

                            const sidebarLeft = false;

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
                                        sidebarPositions.map((position) => (
                                            <aside
                                                key={position.id}
                                                className="lg:col-span-1"
                                            >
                                                {renderPosition(
                                                    position,
                                                    site.widgets_config,
                                                )}
                                            </aside>
                                        ))}

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
                                        sidebarPositions.map((position) => (
                                            <aside
                                                key={position.id}
                                                className="lg:col-span-1"
                                            >
                                                {renderPosition(
                                                    position,
                                                    site.widgets_config,
                                                )}
                                            </aside>
                                        ))}
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
                            <div className="space-y-6">
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
