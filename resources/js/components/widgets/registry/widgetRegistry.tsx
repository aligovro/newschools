import { getOrganizationId } from '@/utils/widgetHelpers';
import React from 'react';
import { DonationWidget } from '../DonationWidget';
import { DonationsListWidget } from '../DonationsListWidget';
import { FormWidget } from '../FormWidget';
import { GalleryWidget } from '../GalleryWidget';
import { HeroWidget } from '../HeroWidgetRefactored';
import { ImageWidget } from '../ImageWidget';
import { MenuWidget } from '../MenuWidget';
import { ProjectsWidget } from '../ProjectsWidget';
import { ReferralLeaderboardWidget } from '../ReferralLeaderboardWidget';
import { RegionRatingWidget } from '../RegionRatingWidget';
import { StatsWidget } from '../StatsWidget';
import { TextWidget } from '../TextWidget';

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
    }) => (
        <HeroWidget
            config={widget.config}
            isEditable={isEditable}
            autoExpandSettings={autoExpandSettings}
            onSave={onSave}
            widgetId={widget.id}
            onConfigChange={onConfigChange}
        />
    ),

    // Текстовый виджет
    text: ({ widget, isEditable, autoExpandSettings, onSave }) => {
        const cfg = widget.config;
        return (
            <TextWidget
                config={{
                    title: cfg.title as string,
                    content: cfg.content as string,
                    fontSize: cfg.fontSize as string,
                    textAlign: cfg.textAlign as 'left' | 'center' | 'right',
                    backgroundColor: cfg.backgroundColor as string,
                    textColor: cfg.textColor as string,
                    titleColor: cfg.titleColor as string,
                    padding: cfg.padding as string,
                    margin: cfg.margin as string,
                    borderRadius: cfg.borderRadius as string,
                    borderWidth: cfg.borderWidth as string,
                    borderColor: cfg.borderColor as string,
                    enableFormatting: cfg.enableFormatting as boolean,
                    enableColors: cfg.enableColors as boolean,
                }}
                isEditable={isEditable}
                autoExpandSettings={autoExpandSettings}
                onSave={onSave}
                widgetId={widget.id}
            />
        );
    },

    // Галерея
    gallery: ({ widget }) => {
        const cfg = widget.config;
        return (
            <GalleryWidget
                images={(cfg.images as string[]) || []}
                columns={cfg.columns as number}
                showCaptions={cfg.showCaptions as boolean}
                lightbox={cfg.lightbox as boolean}
            />
        );
    },

    // Статистика
    stats: ({ widget }) => {
        const cfg = widget.config;
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
            />
        );
    },

    // Проекты
    projects: ({ widget }) => {
        const cfg = widget.config;
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
            />
        );
    },

    // Изображение
    image: ({ widget }) => {
        const cfg = widget.config;
        return (
            <ImageWidget
                image={cfg.image as string}
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
            />
        );
    },

    // Меню (универсальное - для любой позиции)
    menu: ({ widget, isEditable, onConfigChange }) => (
        <MenuWidget
            config={widget.config}
            isEditable={isEditable}
            onConfigChange={onConfigChange}
        />
    ),

    // Форма
    form: ({ widget, isEditable, onSave: _onSave, onConfigChange, siteId }) => {
        const cfg = widget.config;
        const formWidget = {
            id: typeof widget.id === 'string' ? parseInt(widget.id) : widget.id,
            site_id: (cfg.site_id as number) || siteId || 1,
            name: widget.name,
            slug: widget.slug as 'form',
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

    // Виджет пожертвований
    donation: ({ widget, isEditable, autoExpandSettings, onSave }) => (
        <DonationWidget
            config={widget.config || {}}
            isEditable={isEditable}
            autoExpandSettings={autoExpandSettings}
            onSave={onSave}
            widgetId={widget.id}
            organizationId={getOrganizationId(widget.config)}
        />
    ),

    // Виджет рейтинга регионов
    region_rating: ({
        widget,
        isEditable,
        autoExpandSettings,
        onSave,
        onConfigChange,
    }) => (
        <RegionRatingWidget
            config={widget.config || {}}
            isEditable={isEditable}
            autoExpandSettings={autoExpandSettings}
            onSave={onSave}
            widgetId={widget.id}
            organizationId={getOrganizationId(widget.config)}
            onConfigChange={onConfigChange}
        />
    ),

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
};

/**
 * Рендерер виджета по умолчанию
 */
export const defaultWidgetRenderer: WidgetRenderer = ({ widget }) => (
    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
        <h3 className="mb-2 text-lg font-semibold">{widget.name}</h3>
        <p className="text-gray-600">Виджет "{widget.slug}" не найден</p>
    </div>
);
