import { Breadcrumbs } from '@/components/breadcrumbs';
import { WidgetDisplay } from '@/components/dashboard/site-builder/constructor/WidgetDisplay';
import type {
    WidgetData,
    WidgetPosition,
} from '@/components/dashboard/site-builder/types';
import { useSmoothAnchorNavigation } from '@/hooks';
import { buildSiteSeo } from '@/lib/seo';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React, { ReactNode } from 'react';
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
        /** Собственные стили сайта (миграция и т.п.) */
        custom_css?: string | null;
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
    breadcrumbs?: BreadcrumbItem[];
    /**
     * Дополнительные SEO/OG-override для конкретной страницы
     * (например, данные проекта, новости, организации).
     */
    seoOverrides?: Record<string, unknown>;
    /**
     * Предвычисленные сервером SEO-данные.
     * Если переданы, фронт не пересчитывает SEO, а просто рендерит эти значения.
     */
    seo?: {
        title?: string;
        description?: string;
        keywords?: string;
        canonical_url?: string;
        og_title?: string;
        og_description?: string;
        og_type?: string;
        og_image?: string;
        twitter_card?: string;
        twitter_title?: string;
        twitter_description?: string;
        twitter_image?: string;
    };
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
    breadcrumbs = [],
    seoOverrides,
    seo,
}) => {
    useSmoothAnchorNavigation();

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

        const footerAll = positions.filter((p) => p.area === 'footer');
        const footerCols = footerAll.filter((p) =>
            footerColSlugs.includes(p.slug),
        );
        const contentBottom = positions.filter(
            (p) => p.slug === 'content-bottom',
        );
        const footerOther = footerAll.filter(
            (p) =>
                !footerColSlugs.includes(p.slug) && p.slug !== 'content-bottom',
        );

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
            contentBottom,
            footerCols,
            footerOther,
        };
    }, [positions]);

    const renderPosition = (
        position: WidgetPosition,
        _widgets: WidgetData[],
    ) => {
        if (!shouldShowPosition(position)) return null;
        const positionWidgets = widgetsByPosition[position.slug] || [];

        // Фильтруем только реально видимые виджеты (по правилам видимости)
        const visibleWidgets = positionWidgets.filter((widget) =>
            shouldShowWidget(widget),
        );

        // Если в позиции нет ни одного видимого виджета, не рендерим блок вообще
        if (visibleWidgets.length === 0) {
            return null;
        }

        const layout = getLayoutFor(position);
        const containerClass =
            layout.width === 'boxed' ? 'container mx-auto' : '';
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
                    {visibleWidgets.length > 0 && (
                        <div className={`${position.slug}-wrapper`}>
                            {visibleWidgets.map((widget) => (
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

    // SEO / Open Graph
    const currentUrl =
        typeof window !== 'undefined' ? window.location.href : undefined;

    // Если сервер уже посчитал SEO (props.seo) — используем его.
    const seoFromServer = React.useMemo(() => {
        if (!seo) return null;
        const canonicalUrl = seo.canonical_url || currentUrl || undefined;

        return {
            title: seo.title || site.name,
            description: seo.description || site.description || '',
            keywords: seo.keywords,
            canonicalUrl,
            ogTitle: seo.og_title || seo.title || site.name,
            ogDescription:
                seo.og_description || seo.description || site.description || '',
            ogType: seo.og_type || 'website',
            ogImage: seo.og_image,
            twitterCard: seo.twitter_card || 'summary_large_image',
            twitterTitle:
                seo.twitter_title || seo.og_title || seo.title || site.name,
            twitterDescription:
                seo.twitter_description ||
                seo.og_description ||
                seo.description ||
                site.description ||
                '',
            twitterImage: seo.twitter_image || seo.og_image,
        };
    }, [seo, currentUrl, site.name, site.description]);

    // Если seo с сервера нет (например, в админке), используем фронтовый билд.
    const seoData = React.useMemo(() => {
        if (seoFromServer) return seoFromServer;

        const mergedSeoConfig = {
            ...(site.seo_config || {}),
            ...(seoOverrides || {}),
        } as Record<string, unknown>;

        return buildSiteSeo({
            siteName: site.name,
            siteDescription: site.description,
            rawSeo: mergedSeoConfig,
            pageTitleOverride: pageTitle,
            pageDescriptionOverride: pageDescription,
            currentUrl,
        });
    }, [
        seoFromServer,
        site.seo_config,
        seoOverrides,
        site.name,
        site.description,
        pageTitle,
        pageDescription,
        currentUrl,
    ]);

    return (
        <>
            {site.custom_css && (
                <style dangerouslySetInnerHTML={{ __html: site.custom_css }} />
            )}
            {(site as { styles_css_url?: string | null }).styles_css_url && (
                <link
                    rel="stylesheet"
                    href={(site as { styles_css_url: string }).styles_css_url}
                />
            )}
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
                {/* Robots meta tag для индексации */}
                <meta name="robots" content="index, follow" />
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
            </Head>

            <div className={getSitePreviewClasses()}>
                {/* Header: четыре колонки (header-col-1..4) */}
                <header className="site-header">
                    {(() => {
                        const { headerCols, headerFull, headerAll } =
                            positionsByArea;

                        // Оставляем только те header-col-* позиции, где есть видимые виджеты
                        const headerColsWithContent = headerCols.filter(
                            (position) => {
                                const positionWidgets =
                                    widgetsByPosition[position.slug] || [];
                                const visibleWidgets = positionWidgets.filter(
                                    (widget) => shouldShowWidget(widget),
                                );
                                return visibleWidgets.length > 0;
                            },
                        );

                        return (
                            <div className="site-header__blocks">
                                {/* Если есть хотя бы одна колонка с контентом — показываем только их */}
                                {headerColsWithContent.length > 0 && (
                                    <div className="site-header__container container">
                                        <div className="site-header__columns">
                                            {headerColsWithContent.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="site-header__column"
                                                >
                                                    {renderPosition(
                                                        p,
                                                        site.widgets_config,
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Полноширинный header, если он есть */}
                                {headerFull &&
                                    renderPosition(
                                        headerFull,
                                        site.widgets_config,
                                    )}
                                {/* Если нет ни колонок с контентом, ни header, рендерим все header-позиции (режим без конфигурации) */}
                                {!headerFull &&
                                    headerColsWithContent.length === 0 && (
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
                    <div className="p-lr-60 container mx-auto">
                        {breadcrumbs.length > 0 && (
                            <div className="breadcrumbs__wrapper">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        )}
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

                            const gridTemplateClass = sidebarLeft
                                ? 'lg:grid-cols-[minmax(360px,1fr)_repeat(3,minmax(0,1fr))]'
                                : 'lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(360px,1fr)]';

                            return (
                                <div
                                    className={`grid grid-cols-1 gap-8 lg:gap-24 ${gridTemplateClass}`}
                                >
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

                {/* content-bottom: независимый блок ПОД основным контентом, ПЕРЕД футером */}
                {positionsByArea.contentBottom.length > 0 && (
                    <section className="site-content-bottom">
                        <div className="site-content-bottom__container container">
                            {positionsByArea.contentBottom.map((p) => (
                                <div key={p.id}>
                                    {renderPosition(p, site.widgets_config)}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer: четыре колонки (footer-col-1..4) + остальные футер-позиции */}
                <footer className="site-footer mb-60 mt-60">
                    <div className="site-footer--wrapper container">
                        {(() => {
                            const { footerCols, footerOther } = positionsByArea;

                            return (
                                <div className="footer-container">
                                    {footerCols.length > 0 && (
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            {footerCols.map((p, index) => (
                                                <div
                                                    key={p.id}
                                                    className={`footer-grid-${index + 1}`}
                                                >
                                                    {renderPosition(
                                                        p,
                                                        site.widgets_config,
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {footerOther.map((p) => (
                                        <div key={p.id}>
                                            {renderPosition(
                                                p,
                                                site.widgets_config,
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </footer>
            </div>
        </>
    );
};

export default MainLayout;
