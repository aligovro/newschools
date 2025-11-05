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
                const cfg = widget.configs
                    ? (() => {
                          const config: Record<string, unknown> = {};
                          widget.configs.forEach((item) => {
                              let value: unknown = item.config_value;
                              switch (item.config_type) {
                                  case 'number':
                                      value = parseFloat(value as string);
                                      break;
                                  case 'boolean':
                                      value =
                                          value === '1' || value === 'true';
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
                      })()
                    : widget.config || {};
                const title = (cfg.title as string) || widget.name || 'Текстовый блок';

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

            // Специальный превью для Hero виджета
            if (
                previewMode &&
                (widget.widget_slug === 'hero' ||
                    widget.widget_slug === 'slider')
            ) {
                const cfg = widget.config || {};
                const type = cfg.type || (cfg.slides ? 'slider' : 'single');

                // Получаем слайды из hero_slides, slider_slides или из config
                let slides: unknown[] = [];

                // Приоритет: config.slides > slider_slides > hero_slides
                if (cfg.slides && Array.isArray(cfg.slides)) {
                    slides = cfg.slides as unknown[];
                } else if (
                    widget.slider_slides &&
                    widget.slider_slides.length > 0
                ) {
                    slides = widget.slider_slides;
                } else if (
                    widget.hero_slides &&
                    widget.hero_slides.length > 0
                ) {
                    slides = widget.hero_slides;
                }

                // Для слайдера показываем оптимизированное превью без Swiper
                if (widget.widget_slug === 'slider' && slides.length > 0) {
                    // Функция для получения значения из configs
                    const getConfigValue = (
                        configs:
                            | Array<{
                                  config_key: string;
                                  config_value: string;
                                  config_type: string;
                              }>
                            | undefined,
                        key: string,
                        defaultValue: unknown,
                    ): unknown => {
                        if (!configs) return defaultValue;
                        const config = configs.find(
                            (c) => c.config_key === key,
                        );
                        if (!config) return defaultValue;

                        try {
                            return JSON.parse(config.config_value);
                        } catch {
                            return config.config_value;
                        }
                    };

                    // Извлекаем настройки из configs или из config
                    const layout =
                        (getConfigValue(
                            widget.configs,
                            'layout',
                            cfg.layout,
                        ) as string) || 'fullwidth';
                    const slidesPerView =
                        (getConfigValue(
                            widget.configs,
                            'slidesPerView',
                            cfg.slidesPerView,
                        ) as number) || 1;

                    // Определяем, какой слайд(ы) показывать
                    let slidesToShow: unknown[] = [];

                    if (layout === 'fullwidth') {
                        // Для полноширинного слайдера показываем только последний слайд
                        slidesToShow = [slides[slides.length - 1]];
                    } else if (layout === 'grid') {
                        // Для сеточного слайдера показываем последнюю строку
                        const totalSlides = slides.length;
                        const slidesInLastRow =
                            totalSlides % slidesPerView || slidesPerView;
                        const startIndex = totalSlides - slidesInLastRow;
                        slidesToShow = slides.slice(startIndex);
                    } else {
                        // Fallback - показываем последний слайд
                        slidesToShow = [slides[slides.length - 1]];
                    }

                    return (
                        <div className="rounded-lg border border-gray-200 bg-white">
                            <div className="relative h-48 overflow-hidden rounded-t-lg">
                                {layout === 'grid' &&
                                slidesToShow.length > 1 ? (
                                    // Сеточное отображение - показываем слайды в ряд
                                    <div className="flex h-full gap-2 p-2">
                                        {slidesToShow.map((slide, index) => {
                                            const slideData = slide as Record<
                                                string,
                                                unknown
                                            >;
                                            const slideBg =
                                                (slideData?.backgroundImage as string) ||
                                                (slideData?.background_image as string) ||
                                                '';
                                            const slideTitle =
                                                (slideData?.title as string) ||
                                                `Слайд ${index + 1}`;
                                            const slideOverlayColor =
                                                (slideData?.overlayColor as string) ||
                                                '#000000';
                                            const slideOverlayOpacity =
                                                (slideData?.overlayOpacity as number) ||
                                                0;

                                            return (
                                                <div
                                                    key={index}
                                                    className="relative flex-1 overflow-hidden rounded"
                                                    style={{
                                                        backgroundImage: slideBg
                                                            ? `url(${slideBg})`
                                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition:
                                                            'center',
                                                    }}
                                                >
                                                    {/* Наложение для слайда */}
                                                    {slideOverlayOpacity >
                                                        0 && (
                                                        <div
                                                            className="absolute inset-0"
                                                            style={{
                                                                backgroundColor: `${slideOverlayColor}${Math.round(
                                                                    (slideOverlayOpacity /
                                                                        100) *
                                                                        255,
                                                                )
                                                                    .toString(
                                                                        16,
                                                                    )
                                                                    .padStart(
                                                                        2,
                                                                        '0',
                                                                    )}`,
                                                            }}
                                                        />
                                                    )}
                                                    {/* Заголовок слайда */}
                                                    <div className="absolute bottom-2 left-2 text-white">
                                                        <div className="max-w-20 truncate text-xs font-medium">
                                                            {slideTitle}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // Полноширинное отображение - показываем один слайд
                                    <div className="relative h-full">
                                        {slidesToShow.map((slide, index) => {
                                            const slideData = slide as Record<
                                                string,
                                                unknown
                                            >;
                                            const slideBg =
                                                (slideData?.backgroundImage as string) ||
                                                (slideData?.background_image as string) ||
                                                '';
                                            const slideTitle =
                                                (slideData?.title as string) ||
                                                `Слайд ${index + 1}`;
                                            const slideOverlayColor =
                                                (slideData?.overlayColor as string) ||
                                                '#000000';
                                            const slideOverlayOpacity =
                                                (slideData?.overlayOpacity as number) ||
                                                0;

                                            return (
                                                <div
                                                    key={index}
                                                    className="relative h-full w-full"
                                                    style={{
                                                        backgroundImage: slideBg
                                                            ? `url(${slideBg})`
                                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition:
                                                            'center',
                                                    }}
                                                >
                                                    {/* Наложение для слайда */}
                                                    {slideOverlayOpacity >
                                                        0 && (
                                                        <div
                                                            className="absolute inset-0"
                                                            style={{
                                                                backgroundColor: `${slideOverlayColor}${Math.round(
                                                                    (slideOverlayOpacity /
                                                                        100) *
                                                                        255,
                                                                )
                                                                    .toString(
                                                                        16,
                                                                    )
                                                                    .padStart(
                                                                        2,
                                                                        '0',
                                                                    )}`,
                                                            }}
                                                        />
                                                    )}
                                                    {/* Заголовок слайда */}
                                                    <div className="absolute bottom-4 left-4 text-white">
                                                        <div className="max-w-32 truncate text-sm font-medium">
                                                            {slideTitle}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <div className="text-sm font-medium text-gray-900">
                                    Слайдер
                                </div>
                                <div className="text-xs text-gray-500">
                                    {slides.length} слайдов
                                </div>
                            </div>
                        </div>
                    );
                }

                // Для hero или пустого слайдера показываем обычное превью
                const previewSlide =
                    type === 'slider' && slides.length > 0
                        ? (slides[slides.length - 1] as Record<string, unknown>)
                        : (cfg.singleSlide as Record<string, unknown>) || null;

                const bg: string =
                    (previewSlide?.backgroundImage as string) ||
                    (previewSlide?.background_image as string) ||
                    '';
                const safeBg =
                    typeof bg === 'string' && bg.startsWith('blob:') ? '' : bg;
                const title =
                    (previewSlide?.title as string) || widget.name || 'Hero';

                // Получаем настройки наложения из слайда
                const overlayColor =
                    (previewSlide?.overlayColor as string) || '#000000';
                const overlayOpacity =
                    (previewSlide?.overlayOpacity as number) || 0;
                const overlayGradient =
                    (previewSlide?.overlayGradient as string) || 'none';
                const overlayGradientIntensity =
                    (previewSlide?.overlayGradientIntensity as number) || 50;

                // Функция для создания стиля наложения (аналогично HeroWidgetRefactored)
                const getGradientStyle = (
                    color: string,
                    opacity: number,
                    gradient: string,
                    intensity: number,
                ) => {
                    const alpha = opacity / 100;
                    const colorWithAlpha = `${color}${Math.round(alpha * 255)
                        .toString(16)
                        .padStart(2, '0')}`;

                    switch (gradient) {
                        case 'left':
                            return `linear-gradient(to right, ${colorWithAlpha} ${intensity}%, transparent)`;
                        case 'right':
                            return `linear-gradient(to left, ${colorWithAlpha} ${intensity}%, transparent)`;
                        case 'top':
                            return `linear-gradient(to bottom, ${colorWithAlpha} ${intensity}%, transparent)`;
                        case 'bottom':
                            return `linear-gradient(to top, ${colorWithAlpha} ${intensity}%, transparent)`;
                        case 'center':
                            return `radial-gradient(circle, ${colorWithAlpha} ${intensity}%, transparent)`;
                        default:
                            return colorWithAlpha;
                    }
                };

                const overlayStyle =
                    overlayOpacity > 0 && overlayGradient !== 'none'
                        ? getGradientStyle(
                              overlayColor,
                              overlayOpacity,
                              overlayGradient,
                              overlayGradientIntensity,
                          )
                        : overlayOpacity > 0
                          ? `${overlayColor}${Math.round(
                                (overlayOpacity / 100) * 255,
                            )
                                .toString(16)
                                .padStart(2, '0')}`
                          : '';

                return (
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="relative h-48 overflow-hidden rounded-t-lg bg-cover bg-center">
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: safeBg
                                        ? `url(${safeBg})`
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                }}
                            />
                            {/* Наложение */}
                            {overlayStyle && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: overlayStyle,
                                    }}
                                />
                            )}
                        </div>
                        <div className="p-3">
                            <div className="text-sm font-medium text-gray-900">
                                {title}
                            </div>
                            <div className="text-xs text-gray-500">
                                {widget.widget_slug === 'hero'
                                    ? 'Hero'
                                    : widget.widget_slug === 'slider'
                                      ? slides.length > 0
                                          ? `Slider (${slides.length} слайдов)`
                                          : 'Slider (предпросмотр)'
                                      : 'Widget'}{' '}
                                {widget.widget_slug !== 'slider' &&
                                    '(предпросмотр)'}
                            </div>
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
