import { WidgetDisplay } from '@/components/site-builder/WidgetDisplay';
import { widgetsSystemApi } from '@/lib/api/index';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    template: string;
    widgets_config: Array<{
        id: string;
        name: string;
        slug: string;
        config: Record<string, unknown>;
        settings: Record<string, unknown>;
        position_name: string;
        position_slug?: string;
        order: number;
        is_active: boolean;
        is_visible: boolean;
        widget?: {
            id: number;
            name: string;
            slug: string;
        };
        position?: {
            id: number;
            name: string;
            slug: string;
            area: string;
        };
        // Нормализованные данные
        configs?: Array<{
            config_key: string;
            config_value: string;
            config_type: string;
        }>;
        hero_slides?: Array<{
            id: number;
            title: string;
            subtitle?: string;
            description?: string;
            button_text?: string;
            button_link?: string;
            button_link_type: string;
            button_open_in_new_tab: boolean;
            background_image?: string;
            overlay_color?: string;
            overlay_opacity?: number;
            overlay_gradient?: string;
            overlay_gradient_intensity?: number;
            overlay_style?: string;
            sort_order: number;
            is_active: boolean;
        }>;
        form_fields?: Array<{
            id: number;
            field_name: string;
            field_type: string;
            field_label?: string;
            field_placeholder?: string;
            field_help_text?: string;
            field_required: boolean;
            field_options?: any;
            field_validation?: any;
            field_styling?: any;
            field_order: number;
            is_active: boolean;
        }>;
        menu_items?: Array<{
            id: number;
            item_id: string;
            title: string;
            url: string;
            type: string;
            open_in_new_tab: boolean;
            sort_order: number;
            is_active: boolean;
        }>;
        gallery_images?: Array<{
            id: number;
            image_url: string;
            alt_text?: string;
            title?: string;
            description?: string;
            sort_order: number;
            is_active: boolean;
        }>;
        donation_settings?: {
            id: number;
            title?: string;
            description?: string;
            min_amount?: number;
            max_amount?: number;
            suggested_amounts?: number[];
            currency: string;
            show_amount_input: boolean;
            show_anonymous_option: boolean;
            button_text: string;
            success_message?: string;
            payment_methods?: any;
        };
        region_rating_settings?: {
            id: number;
            items_per_page: number;
            title?: string;
            description?: string;
            sort_by: string;
            sort_direction: string;
            show_rating: boolean;
            show_donations_count: boolean;
            show_progress_bar: boolean;
            display_options?: any;
        };
        donations_list_settings?: {
            id: number;
            items_per_page: number;
            title?: string;
            description?: string;
            sort_by: string;
            sort_direction: string;
            show_amount: boolean;
            show_donor_name: boolean;
            show_date: boolean;
            show_message: boolean;
            show_anonymous: boolean;
            display_options?: any;
        };
        referral_leaderboard_settings?: {
            id: number;
            items_per_page: number;
            title?: string;
            description?: string;
            sort_by: string;
            sort_direction: string;
            show_rank: boolean;
            show_referrals_count: boolean;
            show_total_donations: boolean;
            show_avatar: boolean;
            display_options?: any;
        };
        image_settings?: {
            id: number;
            image_url: string;
            alt_text?: string;
            title?: string;
            description?: string;
            link_url?: string;
            link_type: string;
            open_in_new_tab: boolean;
            alignment: string;
            width?: string;
            height?: string;
            styling?: any;
        };
    }>;
    seo_config: Record<string, unknown>;
}

interface WidgetPosition {
    id: number;
    name: string;
    slug: string;
    area: string;
}

interface SitePreviewProps {
    site: Site;
}

const SitePreview: React.FC<SitePreviewProps> = ({ site }) => {
    const [positions, setPositions] = useState<WidgetPosition[]>([]);
    const [loading, setLoading] = useState(true);

    // Загружаем позиции виджетов
    useEffect(() => {
        const loadPositions = async () => {
            try {
                setLoading(true);
                const templateId = (site.template as any)?.id || 1;
                const positionsData =
                    await widgetsSystemApi.getWidgetPositions(templateId);

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
    }, [site.template]);

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

        return (
            <div
                key={position.id}
                className={`site-position site-position--${position.slug}`}
            >
                <div className="container mx-auto px-4">
                    {positionWidgets.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            <p>Нет виджетов в позиции "{position.name}"</p>
                        </div>
                    ) : (
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
                {/* Рендерим позиции в том же порядке, что и в SiteBuilder */}
                {positions
                    .filter((p) => p.area === 'header')
                    .map((position) => (
                        <header key={position.id} className="site-header">
                            {renderPosition(position, site.widgets_config)}
                        </header>
                    ))}

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

                {/* Footer */}
                {positions
                    .filter((p) => p.area === 'footer')
                    .map((position) => (
                        <footer key={position.id} className="site-footer">
                            {renderPosition(position, site.widgets_config)}
                        </footer>
                    ))}
            </div>

            <style>{`
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
