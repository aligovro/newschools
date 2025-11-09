import type { WidgetData } from '@/components/dashboard/site-builder/types';
import type { StylingConfig } from '@/components/dashboard/widgets/common/StylingPanel';
import { getConfigValue } from '@/utils/getConfigValue';
import { getOrganizationId } from '@/utils/widgetHelpers';
import React from 'react';
import { AlumniStatsWidget } from '../AlumniStatsWidget';
import { AuthMenuWidget } from '../AuthMenuWidget';
import { DonationsListWidget } from '../DonationsListWidget';
import { FormWidget } from '../FormWidget';
import { GalleryWidget } from '../GalleryWidget';
import { HeroWidget } from '../HeroWidget';
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

interface ConfigItem {
    config_key: string;
    config_value: string;
    config_type: string;
}

interface Project {
    id: number;
    title: string;
    description: string;
    image?: string;
    target_amount: number;
    current_amount: number;
    status: 'active' | 'completed' | 'paused';
    created_at: string;
    deadline?: string;
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
 * Утилитарная функция для конвертации configs в config объект
 */
const convertConfigsToConfig = (
    configs: ConfigItem[],
): Record<string, unknown> => {
    if (!configs || configs.length === 0) return {};
    const config: Record<string, unknown> = {};
    configs.forEach((item) => {
        let value: unknown = item.config_value;
        switch (item.config_type) {
            case 'number':
                value = parseFloat(item.config_value);
                break;
            case 'boolean':
                value =
                    item.config_value === '1' || item.config_value === 'true';
                break;
            case 'json':
                try {
                    value = JSON.parse(item.config_value);
                } catch {
                    console.warn(
                        'Failed to parse JSON config:',
                        item.config_key,
                        item.config_value,
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
        const styling = widget.config?.styling as StylingConfig | undefined;
        const cfg = widget.config || {};
        const css_class =
            (getConfigValue(
                widget.configs,
                'css_class',
                cfg.css_class,
            ) as string) || '';
        return (
            <HeroWidget
                config={cfg}
                isEditable={isEditable}
                autoExpandSettings={autoExpandSettings}
                onSave={onSave}
                widgetId={widget.id}
                onConfigChange={onConfigChange}
                configs={widget.configs}
                styling={styling}
                hero_slides={widget.hero_slides}
                css_class={css_class}
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
        const styling = widget.config?.styling as
            | Record<string, unknown>
            | undefined;
        return (
            <SliderWidget
                config={widget.config || {}}
                isEditable={isEditable}
                autoExpandSettings={autoExpandSettings}
                onSave={onSave}
                widgetId={widget.id}
                onConfigChange={onConfigChange}
                configs={widget.configs}
                styling={styling}
                slider_slides={widget.slider_slides}
            />
        );
    },

    // Текстовый виджет
    text: ({ widget }) => {
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

        const title = cfg.title as string | undefined;
        const content = cfg.content as string | undefined;

        return (
            <div className="text-widget-container">
                {title && (
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
                        {title}
                    </h3>
                )}
                {content && (
                    <div
                        className="text-widget-content"
                        dangerouslySetInnerHTML={{
                            __html: formatTextContent(content),
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
    html: ({ widget }) => {
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
                columns={(cfg.columns as number) || 3}
                showCaptions={(cfg.showCaptions as boolean) || false}
                lightbox={(cfg.lightbox as boolean) || false}
            />
        );
    },

    // Статистика
    stats: ({ widget }) => {
        const cfg = widget.config || {};
        const styling = cfg.styling as StylingConfig | undefined;
        return (
            <StatsWidget
                title={(cfg.title as string) || ''}
                stats={(cfg.stats as StatItem[]) || []}
                columns={(cfg.columns as number) || 3}
                layout={cfg.layout as 'grid' | 'list' | 'carousel' | undefined}
                showIcons={(cfg.showIcons as boolean) || false}
                animation={
                    cfg.animation as 'none' | 'count-up' | 'fade-in' | undefined
                }
                styling={styling}
            />
        );
    },

    // Проекты
    projects: ({ widget }) => {
        const cfg = widget.config || {};
        return (
            <ProjectsWidget
                title={(cfg.title as string) || ''}
                projects={(cfg.projects as Project[]) || []}
                limit={(cfg.limit as number) || 6}
                columns={(cfg.columns as number) || 3}
                showDescription={(cfg.showDescription as boolean) || false}
                showProgress={(cfg.showProgress as boolean) || false}
                showImage={(cfg.showImage as boolean) || false}
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
            />
        );
    },

    // Изображение
    image: ({ widget }) => {
        const cfg = widget.config || {};
        const imageUrl = cfg.image as string | undefined;
        const styling = cfg.styling as StylingConfig | undefined;

        // Если нет изображения, не рендерим виджет
        if (!imageUrl) {
            return null;
        }

        return (
            <ImageWidget
                image={imageUrl}
                altText={(cfg.altText as string) || ''}
                caption={(cfg.caption as string) || ''}
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
                styling={styling}
            />
        );
    },

    // Меню (универсальное - для любой позиции)
    menu: ({ widget, isEditable, onConfigChange }) => {
        // Если редактируемый режим, показываем полный виджет
        if (isEditable) {
            return (
                <MenuWidget
                    configs={widget.configs}
                    isEditable={isEditable}
                    onConfigChange={onConfigChange}
                />
            );
        }

        // В режиме просмотра показываем только названия пунктов через запятую
        const items = getConfigValue(widget.configs, 'items', []) as Array<{
            title: string;
        }>;
        const menuTitles = items
            .map((item) => item.title)
            .filter(Boolean)
            .join(', ');

        return (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                <div className="text-sm font-bold text-gray-800">
                    {menuTitles || 'Меню'}
                </div>
                <div className="mt-1 text-sm text-gray-500">menu</div>
            </div>
        );
    },

    // Меню авторизации (модальные окна входа/регистрации)
    auth_menu: ({ widget, isEditable, onConfigChange }) => {
        const config = widget.config as Record<string, unknown>;
        return (
            <AuthMenuWidget
                config={{
                    ...config,
                    site_id: config.site_id as number | undefined,
                }}
                isEditable={isEditable}
                onConfigChange={onConfigChange}
            />
        );
    },

    // Форма
    form: ({ widget, isEditable, onSave: _onSave, onConfigChange, siteId }) => {
        const cfg = widget.config || {};
        const formWidget = {
            id:
                typeof widget.id === 'string'
                    ? parseInt(widget.id, 10)
                    : Number(widget.id),
            site_id: (cfg.site_id as number) || siteId || 1,
            name: widget.name,
            widget_slug: widget.widget_slug as 'form',
            description: cfg.description as string | undefined,
            settings: (cfg.settings as Record<string, unknown>) || {},
            styling: (cfg.styling as StylingConfig) || {},
            actions: (cfg.actions as unknown[]) || [],
            is_active: widget.is_active,
            is_visible: widget.is_visible,
            sort_order: widget.order,
            fields: (cfg.fields as unknown[]) || [],
            created_at: widget.created_at,
            updated_at: widget.updated_at,
        };

        return (
            <FormWidget
                widget={
                    formWidget as Parameters<typeof FormWidget>[0]['widget']
                }
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
        const styling = cfg.styling as Record<string, unknown> | undefined;
        return (
            <AlumniStatsWidget
                config={{
                    organization_id: (cfg.organization_id as number) || 0,
                    title: (cfg.title as string) || '',
                    showIcons: (cfg.showIcons as boolean) || false,
                }}
                styling={styling}
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

    // Слайдер проектов
    projects_slider: ({ widget }) => {
        const title =
            (widget.name && widget.name.trim()) || 'Слайдер проектов';
        return (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                <div className="text-2xl font-bold text-gray-800">{title}</div>
                <div className="mt-1 text-sm text-gray-500">projects_slider</div>
            </div>
        );
    },

    // Блок подписки на школы (только для главного сайта) — в конструкторе показываем плейсхолдер
    subscribe_block: ({ widget }) => {
        const title =
            (widget.name && widget.name.trim()) || 'Блок подписки на школы';
        return (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                <div className="text-2xl font-bold text-gray-800">{title}</div>
                <div className="mt-1 text-sm text-gray-500">
                    subscribe_block
                </div>
            </div>
        );
    },

    // Блок добавления организации (только для главного сайта) — в конструкторе показываем плейсхолдер
    add_organization_block: ({ widget }) => {
        const title =
            (widget.name && widget.name.trim()) ||
            'Блок добавления организации';
        return (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                <div className="text-2xl font-bold text-gray-800">{title}</div>
                <div className="mt-1 text-sm text-gray-500">
                    add_organization_block
                </div>
            </div>
        );
    },

    // Поиск организаций (только для главного сайта) — в конструкторе показываем плейсхолдер
    organization_search: ({ widget }) => {
        const title =
            (widget.name && widget.name.trim()) || 'Поиск организаций';
        return (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
                <div className="text-2xl font-bold text-gray-800">{title}</div>
                <div className="mt-1 text-sm text-gray-500">
                    organization_search
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
