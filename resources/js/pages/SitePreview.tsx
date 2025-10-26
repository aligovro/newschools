import { WidgetDisplay } from '@/components/site-builder/constructor/WidgetDisplay';
import type {
    WidgetPosition as SharedWidgetPosition,
    WidgetData,
} from '@/components/site-builder/types';
import { widgetsSystemApi } from '@/lib/api/index';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import '../../css/site-preview.scss';

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    template: string; // slug
    widgets_config: WidgetData[];
    seo_config: Record<string, unknown>;
}

type WidgetPosition = SharedWidgetPosition;

interface SitePreviewProps {
    site: Site;
    positions?: WidgetPosition[];
}

const SitePreview: React.FC<SitePreviewProps> = ({
    site,
    positions: ssrPositions,
}) => {
    const [positions, setPositions] = useState<WidgetPosition[]>(
        ssrPositions || [],
    );
    const [loading, setLoading] = useState(
        !(ssrPositions && ssrPositions.length > 0),
    );

    // Логируем данные сайта
    console.log('SitePreview - Site data:', site);
    console.log('SitePreview - Widgets config:', site.widgets_config);

    // Логируем каждый виджет
    site.widgets_config.forEach((widget, index) => {
        console.log(`SitePreview - Widget ${index}:`, {
            id: widget.id,
            name: widget.name,
            widget_slug: widget.widget_slug,
            position_slug: widget.position_slug,
            is_active: widget.is_active,
            is_visible: widget.is_visible,
            config: widget.config,
            hero_slides: widget.hero_slides,
            slider_slides: widget.slider_slides,
        });

        // Детально логируем config для hero и slider виджетов
        if (widget.widget_slug === 'hero' || widget.widget_slug === 'slider') {
            console.log(`SitePreview - ${widget.widget_slug} config details:`, {
                config_keys: Object.keys(widget.config || {}),
                full_config: widget.config,
            });
        }
    });

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

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-gray-500">Загрузка...</div>
            </div>
        );
    }

    const renderPosition = (
        position: WidgetPosition,
        widgets: typeof site.widgets_config,
    ) => {
        const positionWidgets = widgets
            .filter((widget) => widget.position_slug === position.slug)
            .sort((a, b) => a.order - b.order);

        // Логируем данные позиции
        console.log(`SitePreview - renderPosition for ${position.slug}:`, {
            position_slug: position.slug,
            position_name: position.name,
            widgets_in_position: positionWidgets.length,
            widgets: positionWidgets.map((w) => ({
                id: w.id,
                name: w.name,
                widget_slug: w.widget_slug,
                is_active: w.is_active,
                is_visible: w.is_visible,
            })),
        });

        return (
            <div
                key={position.id}
                className={`site-position site-position--${position.slug}`}
            >
                <div className="container mx-auto px-4">
                    {positionWidgets.length > 0 && (
                        <div className="space-y-4">
                            {positionWidgets
                                .filter(
                                    (widget) =>
                                        widget.is_active && widget.is_visible,
                                )
                                .map((widget) => (
                                    <div
                                        key={widget.id}
                                        className="widget-container"
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

    // SEO
    const seo = (site.seo_config || {}) as Record<string, unknown>;
    const getString = (value: unknown): string | undefined =>
        typeof value === 'string' && value.trim() !== '' ? value : undefined;
    const getBoolean = (value: unknown): boolean | undefined => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            const v = value.toLowerCase();
            if (v === 'true') return true;
            if (v === 'false') return false;
        }
        return undefined;
    };
    const pageTitle = getString(seo['title']) ?? site.name;
    const metaDescription =
        getString(seo['description']) ?? site.description ?? '';
    const metaKeywords: string | undefined = getString(seo['keywords']);
    const canonicalUrl: string | undefined =
        getString(seo['canonical_url']) ?? getString(seo['slug_url']);
    const ogImage: string | undefined =
        getString(seo['og_image']) ?? getString(seo['image']);
    const noindex = Boolean(getBoolean(seo['noindex']));

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                {metaKeywords && (
                    <meta name="keywords" content={metaKeywords} />
                )}
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
                {noindex && <meta name="robots" content="noindex,nofollow" />}
                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                {canonicalUrl && (
                    <meta property="og:url" content={canonicalUrl} />
                )}
                {ogImage && <meta property="og:image" content={ogImage} />}
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={metaDescription} />
                {ogImage && <meta name="twitter:image" content={ogImage} />}
                {/* JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: pageTitle,
                            description: metaDescription,
                            url: canonicalUrl,
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
                                        {positions
                                            .filter((p) => p.area === 'header')
                                            .map((p) => (
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

                {positions
                    .filter((p) => p.area === 'hero')
                    .map((position) => (
                        <section key={position.id} className="site-hero">
                            {renderPosition(position, site.widgets_config)}
                        </section>
                    ))}

                {/* Main Content */}
                <main className="site-main">
                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                            {/* Sidebar */}
                            {positions
                                .filter((p) => p.area === 'sidebar')
                                .map((position) => (
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

                            {/* Content */}
                            <div
                                className={
                                    positions.some((p) => p.area === 'sidebar')
                                        ? 'lg:col-span-3'
                                        : 'lg:col-span-4'
                                }
                            >
                                {positions
                                    .filter((p) => p.area === 'content')
                                    .map((position) => (
                                        <div
                                            key={position.id}
                                            className="site-content"
                                        >
                                            {renderPosition(
                                                position,
                                                site.widgets_config,
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
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
                                                    {renderPosition(
                                                        p,
                                                        site.widgets_config,
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {otherFooter.map((p) => (
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

export default SitePreview;
