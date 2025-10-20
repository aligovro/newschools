import React, { memo, useMemo } from 'react';
import {
    defaultWidgetRenderer,
    widgetRegistry,
} from './registry/widgetRegistry';

interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    widget_slug: string;
    config: Record<string, unknown>;
    configs: Array<{
        config_key: string;
        config_value: string;
        config_type: string;
    }>;
    settings: Record<string, unknown>;
    is_active: boolean;
    is_visible: boolean;
    order: number;
    position_name: string;
    position_slug: string;
    created_at: string;
    updated_at?: string;
    // Специализированные данные
    hero_slides?: Array<{
        id: string;
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
            if (previewMode && widget.widget_slug === 'hero') {
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

            // Получаем рендерер из реестра (поддержка старого поля slug)
            const registryKey = (widget as any).widget_slug;
            const renderer =
                widgetRegistry[registryKey] || defaultWidgetRenderer;

            // Рендерим виджет
            return renderer({
                widget,
                isEditable,
                autoExpandSettings,
                onSave,
            });
        }, [widget, isEditable, autoExpandSettings, onSave, previewMode]);

        // Apply universal styling if present in config.styling
        const styling = (widget.config?.styling || {}) as any;
        const style: React.CSSProperties = {
            backgroundColor: styling.backgroundColor,
            color: styling.textColor,
            padding: styling.padding,
            margin: styling.margin,
            borderRadius: styling.borderRadius,
            borderWidth: styling.borderWidth,
            borderColor: styling.borderColor,
            borderStyle: styling.borderWidth ? 'solid' : undefined,
        };
        const shadowClass =
            styling.boxShadow === 'sm'
                ? 'shadow-sm'
                : styling.boxShadow === 'md'
                  ? 'shadow-md'
                  : styling.boxShadow === 'lg'
                    ? 'shadow-lg'
                    : '';
        const extraClass = styling.customClass || '';

        return (
            <div
                className={`widget-renderer ${shadowClass} ${extraClass}`}
                style={style}
            >
                {renderedWidget}
            </div>
        );
    },
);

WidgetRenderer.displayName = 'WidgetRenderer';
