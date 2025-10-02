import React from 'react';
import { FormWidget } from './FormWidget';
import { GalleryWidget } from './GalleryWidget';
import { HeroWidget } from './HeroWidgetRefactored';
import { ImageWidget } from './ImageWidget';
import { MenuWidget } from './MenuWidget';
import { ProjectsWidget } from './ProjectsWidget';
import { StatsWidget } from './StatsWidget';
import { TextWidget } from './TextWidget';

interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    slug: string;
    config: Record<string, unknown>;
    settings: Record<string, unknown>;
    is_active: boolean;
    is_visible: boolean;
    order: number;
    position_name: string;
    position_slug: string;
    created_at: string;
    updated_at?: string;
}

interface WidgetRendererProps {
    widget: WidgetData;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    previewMode?: boolean;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
    widget,
    isEditable = false,
    autoExpandSettings = false,
    onSave,
    previewMode = false,
}) => {
    const renderWidget = () => {
        switch (widget.slug) {
            case 'hero':
            case 'hero-slider':
                if (!previewMode) {
                    return (
                        <HeroWidget
                            config={widget.config}
                            isEditable={isEditable}
                            autoExpandSettings={autoExpandSettings}
                            onSave={onSave}
                            widgetId={widget.id}
                        />
                    );
                }
                // Minimal preview for hero in builder positions
                {
                    const cfg = (widget.config || {}) as any;
                    const type = cfg.type || (cfg.slides ? 'slider' : 'single');
                    const firstSlide =
                        type === 'slider'
                            ? (cfg.slides && cfg.slides[0]) || null
                            : cfg.singleSlide || null;
                    const bg: string = firstSlide?.backgroundImage || '';
                    const safeBg =
                        typeof bg === 'string' && bg.startsWith('blob:')
                            ? ''
                            : bg;
                    const title = firstSlide?.title || widget.name || 'Hero';
                    return (
                        <div className="rounded-lg border border-gray-200 bg-white">
                            <div
                                className="h-48 rounded-t-lg bg-cover bg-center"
                                style={{
                                    backgroundImage: safeBg
                                        ? `url(${safeBg})`
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                }}
                            />
                            <div className="p-3">
                                <div className="text-sm font-medium text-gray-900">
                                    {title}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Hero (предпросмотр)
                                </div>
                            </div>
                        </div>
                    );
                }
            case 'text': {
                const cfg = (widget.config || {}) as any;
                return (
                    <TextWidget
                        config={{
                            title: cfg.title,
                            content: cfg.content,
                            fontSize: cfg.fontSize,
                            textAlign: cfg.textAlign,
                        }}
                        isEditable={isEditable}
                        autoExpandSettings={autoExpandSettings}
                        onSave={onSave}
                        widgetId={widget.id}
                    />
                );
            }
            case 'gallery': {
                const cfg = (widget.config || {}) as any;
                return (
                    <GalleryWidget
                        images={(cfg.images as string[]) || []}
                        columns={cfg.columns}
                        showCaptions={cfg.showCaptions}
                        lightbox={cfg.lightbox}
                    />
                );
            }
            case 'stats': {
                const cfg = (widget.config || {}) as any;
                return (
                    <StatsWidget
                        title={cfg.title}
                        stats={(cfg.stats as any[]) || []}
                        columns={cfg.columns}
                        layout={cfg.layout}
                        showIcons={cfg.showIcons}
                        animation={cfg.animation}
                    />
                );
            }
            case 'projects': {
                const cfg = (widget.config || {}) as any;
                return (
                    <ProjectsWidget
                        title={cfg.title}
                        projects={(cfg.projects as any[]) || []}
                        limit={cfg.limit}
                        columns={cfg.columns}
                        showDescription={cfg.showDescription}
                        showProgress={cfg.showProgress}
                        showImage={cfg.showImage}
                        animation={cfg.animation}
                        hoverEffect={cfg.hoverEffect}
                    />
                );
            }
            case 'image': {
                const cfg = (widget.config || {}) as any;
                return (
                    <ImageWidget
                        image={cfg.image}
                        altText={cfg.altText}
                        caption={cfg.caption}
                        alignment={cfg.alignment}
                        size={cfg.size}
                    />
                );
            }
            case 'header-menu':
            case 'menu': {
                const cfg = (widget.config || {}) as any;
                return (
                    <MenuWidget
                        config={cfg}
                        isEditable={isEditable}
                        autoExpandSettings={autoExpandSettings}
                        onSave={onSave}
                        widgetId={widget.id}
                    />
                );
            }
            case 'contacts': {
                const cfg = (widget.config || {}) as any;
                return (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <h3 className="mb-2 text-lg font-semibold">
                            {widget.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Контактный виджет рендерится на публичной странице.
                            В редакторе доступна настройка в модальном окне.
                        </p>
                    </div>
                );
            }
            case 'form': {
                const cfg = (widget.config || {}) as any;
                const formWidget = {
                    id: widget.id,
                    site_id: cfg.site_id || 1,
                    name: widget.name,
                    slug: widget.slug,
                    description: cfg.description,
                    settings: cfg.settings || {},
                    styling: cfg.styling || {},
                    actions: cfg.actions || [],
                    is_active: widget.is_active,
                    sort_order: widget.order,
                    fields: cfg.fields || [],
                };

                return (
                    <FormWidget
                        widget={formWidget}
                        isEditable={isEditable}
                        onConfigChange={
                            onSave ? (config) => onSave(config) : undefined
                        }
                        onSave={onSave}
                    />
                );
            }
            default:
                return (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                        <h3 className="mb-2 text-lg font-semibold">
                            {widget.name}
                        </h3>
                        <p className="text-gray-600">
                            Виджет "{widget.slug}" не найден
                        </p>
                    </div>
                );
        }
    };

    return <div className="widget-renderer">{renderWidget()}</div>;
};
