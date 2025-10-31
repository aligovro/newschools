import { getOrganizationId } from '@/utils/widgetHelpers';
import React from 'react';
import { AlumniStatsWidget } from '../AlumniStatsWidget';
import { AuthMenuWidget } from '../AuthMenuWidget';
import { DonationsListWidget } from '../DonationsListWidget';
import { FormWidget } from '../FormWidget';
import { GalleryWidget } from '../GalleryWidget';
import { HeroWidget } from '../HeroWidgetRefactored';
import { HtmlWidget } from '../HtmlWidget';
import { ImageWidget } from '../ImageWidget';
import { MenuWidget } from '../MenuWidget';
import { ProjectsWidget } from '../ProjectsWidget';
import { ReferralLeaderboardWidget } from '../ReferralLeaderboardWidget';
import { StatsWidget } from '../StatsWidget';
import { SliderWidget } from '../slider';

interface StatItem {
    value: string | number;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    color?: string;
}

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
}

interface WidgetRenderProps {
    widget: WidgetData;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    onConfigChange?: (config: Record<string, unknown>) => void;
    siteId?: number;
}

type WidgetRenderer = (props: WidgetRenderProps) => React.ReactNode;

/**
 * Реестр виджетов с их рендерерами
 */
export const widgetRegistry: Record<string, WidgetRenderer> = {
    // Hero виджет (универсальный - может быть одиночным или слайдером)
    hero: ({
        widget,
        isEditable,
        autoExpandSettings,
        onSave,
        onConfigChange,
    }) => {
        return (
            <HeroWidget
                config={widget.config || {}}
                isEditable={isEditable}
                autoExpandSettings={autoExpandSettings}
                onSave={onSave}
                widgetId={widget.id}
                onConfigChange={onConfigChange}
                configs={widget.configs}
                styling={widget.config?.styling}
                hero_slides={widget.hero_slides}
            />
        );
    },

    // Универсальный слайдер
    slider: ({
        widget,
        isEditable,
        autoExpandSettings,
        onSave,
        onConfigChange,
    }) => {
        return (
            <SliderWidget
                config={widget.config || {}}
                isEditable={isEditable}
                autoExpandSettings={autoExpandSettings}
                onSave={onSave}
                widgetId={widget.id}
                onConfigChange={onConfigChange}
                configs={widget.configs}
                styling={widget.config?.styling}
                slider_slides={widget.slider_slides}
            />
        );
    },

    // Текстовый виджет
    text: ({ widget, isEditable, autoExpandSettings, onSave }) => {
        // Утилитарная функция для работы с configs
        const convertConfigsToConfig = (
            configs: any[],
        ): Record<string, unknown> => {
            if (!configs || configs.length === 0) return {};
            const config: any = {};
            configs.forEach((item) => {
                let value = item.config_value;
                switch (item.config_type) {
                    case 'number':
                        value = parseFloat(value);
                        break;
                    case 'boolean':
                        value = value === '1' || value === 'true';
                        break;
                    case 'json':
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            console.warn(
                                'Failed to parse JSON config:',
                                item.config_key,
                                value,
                            );
                        }
                        break;
                    default:
                        break;
                }
                config[item.config_key] = value;
            });
            return config;
        };

        // Функция для форматирования текста
        const formatTextContent = (text: string): string => {
            if (!text) return '';

            return (
                text
                    // Жирный текст
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    // Курсив
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    // Подчеркнутый
                    .replace(/__(.*?)__/g, '<u>$1</u>')
                    // Выравнивание
                    .replace(
                        /\[left\](.*?)\[\/left\]/g,
                        '<div style="text-align: left;">$1</div>',
                    )
                    .replace(
                        /\[center\](.*?)\[\/center\]/g,
                        '<div style="text-align: center;">$1</div>',
                    )
                    .replace(
                        /\[right\](.*?)\[\/right\]/g,
                        '<div style="text-align: right;">$1</div>',
                    )
                    // Цитаты
                    .replace(
                        /^> (.*$)/gm,
                        '<blockquote style="border-left: 4px solid #ccc; margin: 0.5rem 0; padding-left: 1rem; font-style: italic; color: #666;">$1</blockquote>',
                    )
                    // Маркированные списки
                    .replace(
                        /^• (.*$)/gm,
                        '<li style="list-style-type: disc; margin-left: 1rem;">$1</li>',
                    )
                    // Нумерованные списки
                    .replace(
                        /^\d+\. (.*$)/gm,
                        '<li style="list-style-type: decimal; margin-left: 1rem;">$1</li>',
                    )
                    // Переносы строк
                    .replace(/\n/g, '<br>')
            );
        };

        const cfg = widget.configs
            ? convertConfigsToConfig(widget.configs)
            : widget.config || {};

        return (
            <div className="text-widget-container">
                {cfg.title && (
                    <h3
                        className="text-widget-title mb-3"
                        style={{
                            color: (cfg.titleColor as string) || '#333',
                            fontSize:
                                cfg.fontSize === 'large'
                                    ? '1.5rem'
                                    : cfg.fontSize === 'small'
                                      ? '1rem'
                                      : '1.25rem',
                            textAlign:
                                (cfg.textAlign as
                                    | 'left'
                                    | 'center'
                                    | 'right') || 'left',
                        }}
                    >
                        {cfg.title as string}
                    </h3>
                )}
                {cfg.content && (
                    <div
                        className="text-widget-content"
                        dangerouslySetInnerHTML={{
                            __html: formatTextContent(cfg.content as string),
                        }}
                        style={{
                            color: (cfg.textColor as string) || '#333',
                            backgroundColor:
                                (cfg.backgroundColor as string) ||
                                'transparent',
                            padding: cfg.padding ? `${cfg.padding}px` : '0',
                            margin: cfg.margin ? `${cfg.margin}px` : '0',
                            borderRadius: cfg.borderRadius
                                ? `${cfg.borderRadius}px`
                                : '0',
                            borderWidth: cfg.borderWidth
                                ? `${cfg.borderWidth}px`
                                : '0',
                            borderColor:
                                (cfg.borderColor as string) || 'transparent',
                            borderStyle: cfg.borderWidth ? 'solid' : 'none',
                            textAlign:
                                (cfg.textAlign as
                                    | 'left'
                                    | 'center'
                                    | 'right') || 'left',
                            fontSize:
                                cfg.fontSize === 'large'
                                    ? '1.125rem'
                                    : cfg.fontSize === 'small'
                                      ? '0.875rem'
                                      : '1rem',
                            lineHeight: '1.6',
                        }}
                    />
                )}
            </div>
        );
    },

    // HTML виджет
    html: ({ widget, isEditable, autoExpandSettings, onSave }) => {
        // Утилитарная функция для работы с configs
        const convertConfigsToConfig = (
            configs: any[],
        ): Record<string, unknown> => {
            if (!configs || configs.length === 0) return {};
            const config: any = {};
            configs.forEach((item) => {
                let value = item.config_value;
                switch (item.config_type) {
                    case 'number':
                        value = parseFloat(value);
                        break;
                    case 'boolean':
                        value = value === '1' || value === 'true';
                        break;
                    case 'json':
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            console.warn(
                                'Failed to parse JSON config:',
                                item.config_key,
                                value,
                            );
                        }
                        break;
                    default:
                        break;
                }
                config[item.config_key] = value;
            });
            return config;
        };

        const cfg = widget.configs
            ? convertConfigsToConfig(widget.configs)
            : widget.config || {};

        return (
            <HtmlWidget
                config={{
                    title: cfg.title as string,
                    htmlContent: cfg.htmlContent as string,
                    enableScripts: cfg.enableScripts as boolean,
                    enableStyles: cfg.enableStyles as boolean,
                    width: cfg.width as string,
                    height: cfg.height as string,
                    backgroundColor: cfg.backgroundColor as string,
                    padding: cfg.padding as string,
                    margin: cfg.margin as string,
                    borderRadius: cfg.borderRadius as string,
                    borderWidth: cfg.borderWidth as string,
                    borderColor: cfg.borderColor as string,
                }}
            />
        );
    },

    // Галерея
    gallery: ({ widget }) => {
        const cfg = widget.config || {};
        return (
            <GalleryWidget
                images={(cfg.images as string[]) || []}
                columns={cfg.columns as number}
                showCaptions={cfg.showCaptions as boolean}
                lightbox={cfg.lightbox as boolean}
                configs={widget.configs}
                styling={cfg.styling as Record<string, any>}
            />
        );
    },

    // Статистика
    stats: ({ widget }) => {
        const cfg = widget.config || {};
        return (
            <StatsWidget
                title={cfg.title as string}
                stats={cfg.stats as StatItem[]}
                columns={cfg.columns as number}
                layout={cfg.layout as 'grid' | 'list' | 'carousel' | undefined}
                showIcons={cfg.showIcons as boolean}
                animation={
                    cfg.animation as 'none' | 'count-up' | 'fade-in' | undefined
                }
                configs={widget.configs}
                styling={cfg.styling as Record<string, any>}
            />
        );
    },

    // Проекты
    projects: ({ widget }) => {
        const cfg = widget.config || {};
        return (
            <ProjectsWidget
                title={cfg.title as string}
                projects={cfg.projects as any}
                limit={cfg.limit as number}
                columns={cfg.columns as number}
                showDescription={cfg.showDescription as boolean}
                showProgress={cfg.showProgress as boolean}
                showImage={cfg.showImage as boolean}
                animation={
                    cfg.animation as
                        | 'none'
                        | 'fade'
                        | 'slide'
                        | 'zoom'
                        | undefined
                }
                hoverEffect={
                    cfg.hoverEffect as
                        | 'none'
                        | 'lift'
                        | 'shadow'
                        | 'scale'
                        | undefined
                }
                configs={widget.configs}
                styling={cfg.styling as Record<string, any>}
            />
        );
    },

    // Изображение
    image: ({ widget }) => {
        const cfg = widget.config || {};
        const imageUrl = cfg.image as string;

        // Если нет изображения, не рендерим виджет
        if (!imageUrl) {
            return null;
        }

        return (
            <ImageWidget
                image={imageUrl}
                altText={cfg.altText as string}
                caption={cfg.caption as string}
                alignment={
                    cfg.alignment as 'left' | 'center' | 'right' | undefined
                }
                size={
                    cfg.size as
                        | 'small'
                        | 'medium'
                        | 'large'
                        | 'full'
                        | undefined
                }
                configs={widget.configs}
                styling={cfg.styling as Record<string, any>}
            />
        );
    },

    // Меню (универсальное - для любой позиции)
    menu: ({ widget, isEditable, onConfigChange }) => (
        <MenuWidget
            configs={widget.configs}
            isEditable={isEditable}
            onConfigChange={onConfigChange}
        />
    ),

    // Меню авторизации (модальные окна входа/регистрации)
    auth_menu: ({ widget, isEditable, onConfigChange }) => (
        <AuthMenuWidget
            config={{
                ...(widget.config as any),
                site_id: (widget.config as any)?.site_id,
            }}
            isEditable={isEditable}
            onConfigChange={onConfigChange}
        />
    ),

    // Форма
    form: ({ widget, isEditable, onSave: _onSave, onConfigChange, siteId }) => {
        const cfg = widget.config || {};
        const formWidget = {
            id: typeof widget.id === 'string' ? parseInt(widget.id) : widget.id,
            site_id: (cfg.site_id as number) || siteId || 1,
            name: widget.name,
            widget_slug: widget.widget_slug as 'form',
            description: cfg.description,
            settings: cfg.settings || {},
            styling: cfg.styling || {},
            actions: (cfg.actions as any[]) || [],
            is_active: widget.is_active,
            is_visible: widget.is_visible,
            sort_order: widget.order,
            fields: (cfg.fields as any[]) || [],
            created_at: widget.created_at,
            updated_at: widget.updated_at,
        };

        return (
            <FormWidget
                widget={formWidget as any}
                isEditable={isEditable}
                onConfigChange={onConfigChange}
            />
        );
    },

    // Виджет пожертвований — в конструкторе показываем плейсхолдер
    donation: ({ widget }) => {
        const title = (widget.name && widget.name.trim()) || 'Пожертвования';
        return (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                <div className="text-2xl font-bold text-gray-800">{title}</div>
                <div className="mt-1 text-sm text-gray-500">donation</div>
            </div>
        );
    },

    // Топ поддерживающих городов — в конструкторе показываем плейсхолдер
    city_supporters: ({ widget }) => {
        const title =
            (widget.name && widget.name.trim()) || 'Топ поддерживающих городов';
        return (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                <div className="text-2xl font-bold text-gray-800">{title}</div>
                <div className="mt-1 text-sm text-gray-500">
                    city_supporters
                </div>
            </div>
        );
    },

    // Виджет списка пожертвований
    donations_list: ({
        widget,
        isEditable,
        autoExpandSettings,
        onSave,
        onConfigChange,
    }) => (
        <DonationsListWidget
            config={widget.config || {}}
            isEditable={isEditable}
            autoExpandSettings={autoExpandSettings}
            onSave={onSave}
            widgetId={widget.id}
            organizationId={getOrganizationId(widget.config)}
            onConfigChange={onConfigChange}
        />
    ),

    // Виджет рейтинга по приглашениям
    referral_leaderboard: ({
        widget,
        isEditable,
        autoExpandSettings,
        onSave,
        onConfigChange,
    }) => (
        <ReferralLeaderboardWidget
            config={widget.config || {}}
            isEditable={isEditable}
            autoExpandSettings={autoExpandSettings}
            onSave={onSave}
            widgetId={widget.id}
            organizationId={getOrganizationId(widget.config)}
            onConfigChange={onConfigChange}
        />
    ),

    // Статистика выпускников
    alumni_stats: ({ widget }) => {
        const cfg = widget.config || {};
        return (
            <AlumniStatsWidget
                config={{
                    organization_id: cfg.organization_id as number,
                    title: cfg.title as string,
                    showIcons: cfg.showIcons as boolean,
                }}
                styling={cfg.styling as Record<string, any>}
            />
        );
    },

    // Школы города (слайдер организаций)
    city_organizations: ({ widget }) => {
        // В конструкторе показываем простой плейсхолдер с названием виджета
        const title = (widget.name && widget.name.trim()) || 'Школы города';
        return (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                <div className="text-2xl font-bold text-gray-800">{title}</div>
                <div className="mt-1 text-sm text-gray-500">
                    city_organizations
                </div>
            </div>
        );
    },
};

/**
 * Рендерер виджета по умолчанию
 */
export const defaultWidgetRenderer: WidgetRenderer = ({ widget }) => (
    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
        <h3 className="mb-2 text-lg font-semibold">{widget.name}</h3>
        <p className="text-gray-600">Виджет "{widget.widget_slug}" не найден</p>
    </div>
);
