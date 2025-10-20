export interface Organization {
    id: number;
    name: string;
    slug: string;
}

export interface SiteWidgetConfigItem {
    config_key: string;
    config_value: string;
    config_type: string;
}

export interface SiteWidgetPositionInfo {
    id: number;
    name: string;
    slug: string;
    description: string;
}

export interface WidgetMetaInfo {
    id: number;
    name: string;
    slug: string;
    category: string;
    icon: string;
    fields_config: unknown;
    settings_config: unknown;
}

export interface SiteWidget {
    id: number | string;
    widget_id: number;
    name: string;
    widget_slug: string;
    config: Record<string, unknown>;
    settings: Record<string, unknown>;
    sort_order: number;
    order: number;
    is_active: boolean;
    is_visible: boolean;
    position_name: string;
    position_slug: string;
    created_at: string;
    updated_at: string;
    configs: SiteWidgetConfigItem[];
    hero_slides?: Array<{
        id: string;
        title: string;
        subtitle?: string;
        description?: string;
        buttonText?: string;
        buttonLink?: string;
        buttonLinkType?: string;
        buttonOpenInNewTab?: boolean;
        backgroundImage?: string;
        overlayColor?: string;
        overlayOpacity?: number;
        overlayGradient?: string;
        overlayGradientIntensity?: number;
        sortOrder?: number;
        isActive?: boolean;
    }>;
    slider_slides?: Array<{
        id: string;
        title: string;
        subtitle?: string;
        description?: string;
        buttonText?: string;
        buttonLink?: string;
        buttonLinkType?: string;
        buttonOpenInNewTab?: boolean;
        backgroundImage?: string;
        overlayColor?: string;
        overlayOpacity?: number;
        overlayGradient?: string;
        overlayGradientIntensity?: number;
        sortOrder?: number;
        isActive?: boolean;
    }>;
    widget: WidgetMetaInfo;
    position: SiteWidgetPositionInfo;
}

export interface SitePage {
    id: number;
    title: string;
    slug: string;
    content: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface OrganizationSite {
    id: number | null;
    name: string;
    slug: string;
    description: string;
    template: string;
    status: 'draft' | 'published' | 'archived';
    is_public: boolean;
    is_maintenance_mode: boolean;
    layout_config: Record<string, unknown>;
    theme_config: Record<string, unknown>;
    content_blocks: unknown[];
    navigation_config: Record<string, unknown>;
    seo_config: Record<string, unknown>;
    created_at: string | null;
    updated_at: string | null;
    url?: string;
    widgets: SiteWidget[];
    pages?: SitePage[];
}

export interface SiteTemplate {
    id: number;
    name: string;
    slug: string;
    description: string;
    layout_config: Record<string, unknown>;
    theme_config: Record<string, unknown>;
    is_premium: boolean;
}

export const getConfigValue = (
    configs: SiteWidgetConfigItem[] = [],
    key: string,
    defaultValue: unknown = null,
): unknown => {
    const config = configs.find((c) => c.config_key === key);
    if (!config) return defaultValue;

    switch (config.config_type) {
        case 'number':
            return parseFloat(config.config_value);
        case 'boolean':
            return (
                config.config_value === '1' || config.config_value === 'true'
            );
        case 'json':
            try {
                return JSON.parse(config.config_value);
            } catch {
                return defaultValue;
            }
        default:
            return config.config_value;
    }
};
