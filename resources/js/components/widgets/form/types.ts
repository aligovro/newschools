export interface FormField {
    id?: number;
    name: string;
    label: string;
    type:
        | 'text'
        | 'email'
        | 'phone'
        | 'textarea'
        | 'select'
        | 'radio'
        | 'checkbox'
        | 'file'
        | 'image'
        | 'number'
        | 'date'
        | 'url'
        | 'hidden'
        | 'heading'
        | 'description';
    placeholder?: string;
    help_text?: string;
    options?: FormFieldOption[];
    validation?: string[];
    styling?: FormFieldStyling;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
    max_file_size?: number;
    allowed_file_types?: string[];
}

export interface FormFieldOption {
    value: string;
    label: string;
    is_selected?: boolean;
}

export interface FormFieldStyling {
    width?: string;
    height?: string;
    background_color?: string;
    text_color?: string;
    border_color?: string;
    border_radius?: string;
    font_size?: string;
    font_weight?: string;
    padding?: string;
    margin?: string;
}

export interface FormAction {
    id?: number;
    name: string;
    type: 'email' | 'webhook' | 'database' | 'telegram' | 'custom';
    config: FormActionConfig;
    is_active: boolean;
    sort_order: number;
}

export interface FormActionConfig {
    // Email action
    to?: string[];
    subject?: string;
    template?: string;

    // Webhook action
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;

    // Database action
    table?: string;
    mapping?: Record<string, string>;

    // Telegram action
    bot_token?: string;
    chat_id?: string;
    message?: string;

    // Custom action
    class?: string;
    file_path?: string;
}

export interface FormWidget {
    id?: number;
    site_id: number;
    name: string;
    widget_slug: string;
    description?: string;
    settings?: FormSettings;
    styling?: FormStyling;
    actions?: FormAction[];
    css_class?: string;
    is_active: boolean;
    sort_order: number;
    fields?: FormField[];
    created_at?: string;
    updated_at?: string;
}

export interface FormSettings {
    title?: string;
    description?: string;
    submit_button_text?: string;
    success_message?: string;
    error_message?: string;
    redirect_url?: string;
    show_labels?: boolean;
    show_placeholders?: boolean;
    show_help_text?: boolean;
    enable_captcha?: boolean;
    captcha_site_key?: string;
    captcha_secret_key?: string;
}

export interface FormStyling {
    container?: {
        max_width?: string;
        padding?: string;
        margin?: string;
        background_color?: string;
        border_radius?: string;
        box_shadow?: string;
    };
    title?: {
        font_size?: string;
        font_weight?: string;
        color?: string;
        margin_bottom?: string;
        text_align?: string;
    };
    description?: {
        font_size?: string;
        color?: string;
        margin_bottom?: string;
        text_align?: string;
    };
    field?: {
        margin_bottom?: string;
    };
    label?: {
        font_size?: string;
        font_weight?: string;
        color?: string;
        margin_bottom?: string;
        display?: string;
    };
    input?: {
        width?: string;
        padding?: string;
        border?: string;
        border_radius?: string;
        font_size?: string;
        color?: string;
        background_color?: string;
        transition?: string;
    };
    input_focus?: {
        border_color?: string;
        box_shadow?: string;
        outline?: string;
    };
    input_error?: {
        border_color?: string;
        box_shadow?: string;
    };
    button?: {
        background_color?: string;
        color?: string;
        padding?: string;
        border?: string;
        border_radius?: string;
        font_size?: string;
        font_weight?: string;
        cursor?: string;
        transition?: string;
        width?: string;
    };
    button_hover?: {
        background_color?: string;
    };
    button_disabled?: {
        background_color?: string;
        cursor?: string;
    };
    error_message?: {
        color?: string;
        font_size?: string;
        margin_top?: string;
    };
    success_message?: {
        color?: string;
        font_size?: string;
        padding?: string;
        background_color?: string;
        border?: string;
        border_radius?: string;
        margin_bottom?: string;
    };
}

export interface FormSubmission {
    id?: number;
    form_widget_id: number;
    data: Record<string, string | string[] | File | null>;
    ip_address?: string;
    user_agent?: string;
    referer?: string;
    status: 'pending' | 'processed' | 'failed';
    error_message?: string;
    actions_log?: FormActionLog[];
    created_at?: string;
    updated_at?: string;
}

export interface FormActionLog {
    action: string;
    success: boolean;
    message?: string;
    timestamp: string;
}

export interface FormWidgetProps {
    widget: FormWidget;
    isEditable?: boolean;
    onConfigChange?: (config: Partial<FormWidget>) => void;
    onSave?: (config: Partial<FormWidget>) => void;
}
