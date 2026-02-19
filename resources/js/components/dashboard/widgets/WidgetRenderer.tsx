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
        backgroundImage?: string;
        overlay_color?: string;
        overlay_opacity?: number;
        overlay_gradient?: string;
        overlay_gradient_intensity?: number;
        overlay_style?: string;
        sort_order: number;
        is_active: boolean;
    }>;
    slider_slides?: Array<{
        id: string;
        title: string;
        subtitle?: string;
        description?: string;
        button_text?: string;
        button_link?: string;
        button_link_type: string;
        button_open_in_new_tab: boolean;
        backgroundImage?: string;
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

// Вспомогательная функция для парсинга конфига виджета
const parseWidgetConfig = (
    configs: WidgetData['configs'],
    fallbackConfig: Record<string, unknown>,
): Record<string, unknown> => {
    if (!configs) {
        return fallbackConfig || {};
    }

    const config: Record<string, unknown> = {};
    configs.forEach((item) => {
        let value: unknown = item.config_value;
        switch (item.config_type) {
            case 'number':
                value = parseFloat(value as string);
                break;
            case 'boolean':
                value = value === '1' || value === 'true';
                break;
            case 'json':
                try {
                    value = JSON.parse(value as string);
                } catch {
                    // ignore
                }
                break;
            default:
                break;
        }
        config[item.config_key] = value;
    });
    return config;
};

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
            // Специальный превью для текстового виджета (плейсхолдер)
            if (previewMode && widget.widget_slug === 'text') {
                const cfg = parseWidgetConfig(
                    widget.configs,
                    widget.config || {},
                );
                const title =
                    (cfg.title as string) || widget.name || 'Текстовый блок';

                return (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                        <div className="text-sm font-bold text-gray-800">
                            {title}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            {widget.widget_slug}
                        </div>
                    </div>
                );
            }

            // Специальный превью для Hero виджета - показываем простой плейсхолдер
            if (previewMode && widget.widget_slug === 'hero') {
                const cfg = parseWidgetConfig(
                    widget.configs,
                    widget.config || {},
                );
                const title = (cfg.title as string) || widget.name || 'Hero';

                return (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                        <div className="text-2xl font-bold text-gray-800">
                            {title}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            {widget.widget_slug}
                        </div>
                    </div>
                );
            }

            // Специальный превью для Slider виджета - показываем простой плейсхолдер
            if (previewMode && widget.widget_slug === 'slider') {
                const cfg = parseWidgetConfig(
                    widget.configs,
                    widget.config || {},
                );

                // Получаем количество слайдов для отображения
                let slidesCount = 0;
                if (cfg.slides && Array.isArray(cfg.slides)) {
                    slidesCount = cfg.slides.length;
                } else if (
                    widget.slider_slides &&
                    widget.slider_slides.length > 0
                ) {
                    slidesCount = widget.slider_slides.length;
                } else if (
                    widget.hero_slides &&
                    widget.hero_slides.length > 0
                ) {
                    slidesCount = widget.hero_slides.length;
                }

                const title = (cfg.title as string) || widget.name || 'Slider';
                const subtitle =
                    slidesCount > 0
                        ? `${slidesCount} слайдов`
                        : widget.widget_slug;

                return (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                        <div className="text-2xl font-bold text-gray-800">
                            {title}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            {subtitle}
                        </div>
                    </div>
                );
            }

            // Специальный превью для Projects Slider виджета - показываем простой плейсхолдер
            if (previewMode && widget.widget_slug === 'projects_slider') {
                const cfg = parseWidgetConfig(
                    widget.configs,
                    widget.config || {},
                );
                const title =
                    (cfg.title as string) || widget.name || 'Слайдер проектов';

                return (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                        <div className="text-2xl font-bold text-gray-800">
                            {title}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            {widget.widget_slug}
                        </div>
                    </div>
                );
            }

            // Получаем рендерер из реестра (поддержка старого поля slug)
            const registryKey = (widget as unknown as Record<string, unknown>)
                .widget_slug as string;
            const renderer =
                widgetRegistry[registryKey] || defaultWidgetRenderer;

            // Рендерим виджет
            return renderer({
                widget: widget as unknown as WidgetData,
                isEditable,
                autoExpandSettings,
                onSave,
            });
        }, [widget, isEditable, autoExpandSettings, onSave, previewMode]);

        // Apply universal styling if present in config.styling
        const styling = (widget.config?.styling || {}) as Record<
            string,
            unknown
        >;
        const style: React.CSSProperties = {
            backgroundColor: styling.backgroundColor as string,
            color: styling.textColor as string,
            padding: styling.padding as string,
            margin: styling.margin as string,
            borderRadius: styling.borderRadius as string,
            borderWidth: styling.borderWidth as string,
            borderColor: styling.borderColor as string,
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
        const extraClass = (styling.customClass as string) || '';

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
