import React, { memo, useMemo } from 'react';
import {
    defaultWidgetRenderer,
    widgetRegistry,
} from './registry/widgetRegistry';

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

export const WidgetRenderer: React.FC<WidgetRendererProps> = memo(
    ({
        widget,
        isEditable = false,
        autoExpandSettings = false,
        onSave,
        previewMode = false,
    }) => {
        // Мемоизируем рендер виджета
        const renderedWidget = useMemo(() => {
            // Специальный превью для Hero виджета
            if (previewMode && widget.slug === 'hero') {
                const cfg = widget.config || {};
                const type = cfg.type || (cfg.slides ? 'slider' : 'single');
                const firstSlide =
                    type === 'slider'
                        ? (cfg.slides as any[])?.[0] || null
                        : cfg.singleSlide || null;
                const bg: string = (firstSlide as any)?.backgroundImage || '';
                const safeBg =
                    typeof bg === 'string' && bg.startsWith('blob:') ? '' : bg;
                const title =
                    (firstSlide as any)?.title || widget.name || 'Hero';

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

            // Получаем рендерер из реестра
            const renderer =
                widgetRegistry[widget.slug] || defaultWidgetRenderer;

            // Рендерим виджет
            return renderer({
                widget,
                isEditable,
                autoExpandSettings,
                onSave,
            });
        }, [widget, isEditable, autoExpandSettings, onSave, previewMode]);

        return <div className="widget-renderer">{renderedWidget}</div>;
    },
);

WidgetRenderer.displayName = 'WidgetRenderer';
