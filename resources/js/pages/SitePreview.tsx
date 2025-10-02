import { WidgetRenderer } from '@/components/widgets';
import { Head } from '@inertiajs/react';
import React from 'react';

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    template: string;
    widgets_config: Array<{
        id: number;
        name: string;
        slug: string;
        config: Record<string, unknown>;
        settings: Record<string, unknown>;
        position_name: string;
        order: number;
        is_active: boolean;
        is_visible: boolean;
    }>;
    seo_config: Record<string, unknown>;
}

interface SitePreviewProps {
    site: Site;
}

const SitePreview: React.FC<SitePreviewProps> = ({ site }) => {
    // Группируем виджеты по позициям
    const widgetsByPosition = site.widgets_config.reduce(
        (acc, widget) => {
            if (!acc[widget.position_name]) {
                acc[widget.position_name] = [];
            }
            acc[widget.position_name].push(widget);
            return acc;
        },
        {} as Record<string, typeof site.widgets_config>,
    );

    // Сортируем виджеты в каждой позиции по порядку
    Object.keys(widgetsByPosition).forEach((position) => {
        widgetsByPosition[position].sort((a, b) => a.order - b.order);
    });

    const renderPosition = (
        positionName: string,
        widgets: typeof site.widgets_config,
    ) => {
        return (
            <div
                key={positionName}
                className={`site-position site-position--${positionName}`}
            >
                <div className="container mx-auto px-4">
                    {widgets
                        .filter(
                            (widget) => widget.is_active && widget.is_visible,
                        )
                        .map((widget) => (
                            <div key={widget.id} className="widget-container">
                                <WidgetRenderer
                                    widget={widget}
                                    isEditable={false}
                                />
                            </div>
                        ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head>
                <title>{site.name}</title>
                <meta name="description" content={site.description || ''} />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </Head>

            <div className="site-preview">
                {/* Header */}
                {widgetsByPosition.header && (
                    <header className="site-header">
                        {renderPosition('header', widgetsByPosition.header)}
                    </header>
                )}

                {/* Hero Section */}
                {widgetsByPosition.hero && (
                    <section className="site-hero">
                        {renderPosition('hero', widgetsByPosition.hero)}
                    </section>
                )}

                {/* Main Content */}
                <main className="site-main">
                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                            {/* Sidebar */}
                            {widgetsByPosition.sidebar && (
                                <aside className="lg:col-span-1">
                                    {renderPosition(
                                        'sidebar',
                                        widgetsByPosition.sidebar,
                                    )}
                                </aside>
                            )}

                            {/* Content */}
                            <div
                                className={
                                    widgetsByPosition.sidebar
                                        ? 'lg:col-span-3'
                                        : 'lg:col-span-4'
                                }
                            >
                                {widgetsByPosition.content && (
                                    <div className="site-content">
                                        {renderPosition(
                                            'content',
                                            widgetsByPosition.content,
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                {widgetsByPosition.footer && (
                    <footer className="site-footer">
                        {renderPosition('footer', widgetsByPosition.footer)}
                    </footer>
                )}
            </div>

            <style jsx>{`
                .site-preview {
                    min-height: 100vh;
                    font-family:
                        system-ui,
                        -apple-system,
                        sans-serif;
                }

                .site-header {
                    background: #fff;
                    border-bottom: 1px solid #e5e7eb;
                }

                .site-hero {
                    background: #f9fafb;
                }

                .site-main {
                    background: #fff;
                }

                .site-footer {
                    background: #1f2937;
                    color: #fff;
                    margin-top: auto;
                }

                .widget-container {
                    margin-bottom: 1rem;
                }

                .widget-container:last-child {
                    margin-bottom: 0;
                }

                /* Адаптивность */
                @media (max-width: 1024px) {
                    .grid-cols-1.lg\\:grid-cols-4 {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
};

export default SitePreview;
