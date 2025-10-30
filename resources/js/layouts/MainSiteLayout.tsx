import { WidgetDisplay } from '@/components/dashboard/site-builder/constructor/WidgetDisplay';
import type {
    WidgetData,
    WidgetPosition,
} from '@/components/dashboard/site-builder/types';
import { Head } from '@inertiajs/react';
import React, { ReactNode } from 'react';
import '../../css/site-preview.scss';

interface MainSiteLayoutProps {
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
    children?: ReactNode;
    pageTitle?: string;
    pageDescription?: string;
}

const MainSiteLayout: React.FC<MainSiteLayoutProps> = ({
    site,
    positions,
    children,
    pageTitle,
    pageDescription,
}) => {
    const renderPosition = (
        position: WidgetPosition,
        widgets: WidgetData[],
    ) => {
        const positionWidgets = widgets
            .filter((widget) => widget.position_slug === position.slug)
            .sort((a, b) => a.order - b.order);

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

                {/* Main Content */}
                <main className="site-main">
                    <div className="container mx-auto px-4 py-8">
                        {children}
                    </div>
                </main>

                {/* Footer: четыре колонки (footer-col-1..4) */}
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

export default MainSiteLayout;
