import type { DonationWidgetData } from '@/lib/api/index';

export interface Fundraiser {
    id: number;
    title: string;
    short_description?: string;
    target_amount: number;
    collected_amount: number;
    progress_percentage: number;
}

export interface Terminology {
    organization_singular: string;
    organization_genitive: string;
    action_support: string;
    member_singular: string;
    member_plural: string;
}

export type OrganizationNeeds = NonNullable<DonationWidgetData['organization_needs']>;
export type ProjectSummary = NonNullable<DonationWidgetData['project']>;

export interface PublicDonationContext {
    organizationId?: number;
    projectId?: number;
    projectStageId?: number;
    progress?: {
        targetAmount: number;
        collectedAmount: number;
        currency?: string;
        labelTarget?: string;
        labelCollected?: string;
    };
}

export interface DonationWidgetConfig {
    title?: string;
    show_title?: boolean;
    description?: string;
    fundraiser_id?: number;
    project_id?: number;
    show_progress?: boolean;
    show_target_amount?: boolean;
    show_collected_amount?: boolean;
    preset_amounts?: number[];
    default_amount?: number;
    min_amount?: number;
    max_amount?: number;
    currency?: 'RUB' | 'USD' | 'EUR';
    payment_methods?: string[];
    default_payment_method?: string;
    show_payment_icons?: boolean;
    allow_recurring?: boolean;
    recurring_periods?: string[];
    default_recurring_period?: 'daily' | 'weekly' | 'monthly';
    require_name?: boolean;
    require_email?: boolean;
    require_phone?: boolean;
    allow_anonymous?: boolean;
    show_message_field?: boolean;
    send_receipt?: boolean;
    thank_you_message?: string;
    button_text?: string;
    button_style?: 'primary' | 'secondary' | 'success' | 'gradient';
    color_scheme?: 'light' | 'dark' | 'auto';
    primary_color?: string;
    border_radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    shadow?: 'none' | 'small' | 'medium' | 'large';
}

export interface DonationProgressData {
    targetAmount: number;
    collectedAmount: number;
    percentage: number;
    labelTarget: string;
    labelCollected: string;
    currency: string;
}

