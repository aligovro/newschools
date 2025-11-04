export interface WidgetPosition {
    id: number;
    template_id?: number;
    name: string;
    slug: string;
    description?: string;
    area: string;
    order: number;
    allowed_widgets?: string[];
    layout_config?: Record<string, unknown>;
    is_required?: boolean;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    widget_slug: string;
    config: Record<string, unknown>;
    settings: Record<string, unknown>;
    is_active: boolean;
    is_visible: boolean;
    order: number;
    position_name: string;
    position_slug: string;
    wrapper_class?: string;
    created_at: string;
    updated_at?: string;
    configs: Array<{
        config_key: string;
        config_value: string;
        config_type: string;
    }>;
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
}
