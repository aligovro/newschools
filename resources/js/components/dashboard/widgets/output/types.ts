// Types for widget output components

export interface WidgetOutputData {
    id: string | number;
    name: string;
    widget_slug: string;
    config: Record<string, unknown>;
    settings: Record<string, unknown>;
    is_active: boolean;
    is_visible: boolean;
    order: number;
    position_name: string;
    position_slug: string;
}

export interface WidgetOutputProps {
    widget: any & {
        widget_slug?: string;
        slug?: string;
        config?: Record<string, unknown>;
    };
    className?: string;
    style?: React.CSSProperties;
}

// Hero specific types
export interface HeroOutputConfig {
    type?: 'single' | 'slider';
    height?: string;
    animation?: 'fade' | 'slide' | 'zoom' | 'flip' | 'cube';
    autoplay?: boolean;
    autoplayDelay?: number;
    loop?: boolean;
    showDots?: boolean;
    showArrows?: boolean;
    slides?: HeroSlide[];
    hero_slides?: HeroSlide[];
    singleSlide?: HeroSlide;
    css_class?: string;
    styling?: Record<string, unknown>;
}

export interface HeroSlide {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    buttonOpenInNewTab?: boolean;
    buttonLinkType?: 'internal' | 'external';
    backgroundImage?: string;
    overlayOpacity?: number;
    overlayColor?: string;
    overlayGradient?: 'none' | 'left' | 'right' | 'top' | 'bottom' | 'center';
    overlayGradientIntensity?: number;
    sortOrder?: number;
    isActive?: boolean;
}

// Text widget types
export interface TextOutputConfig {
    title?: string;
    content?: string;
    fontSize?: string;
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    titleColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    enableFormatting?: boolean;
    enableColors?: boolean;
}

// Image widget types
export interface ImageOutputConfig {
    image?: string;
    altText?: string;
    caption?: string;
    alignment?: 'left' | 'center' | 'right';
    size?: 'small' | 'medium' | 'large' | 'full';
    linkUrl?: string;
    linkType?: 'internal' | 'external';
    openInNewTab?: boolean;
}

// Gallery widget types
export interface GalleryOutputConfig {
    images?: string[];
    columns?: number;
    showCaptions?: boolean;
    lightbox?: boolean;
}

// Stats widget types
export interface StatItem {
    value: string | number;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    color?: string;
}

export interface StatsOutputConfig {
    title?: string;
    stats?: StatItem[];
    columns?: number;
    layout?: 'grid' | 'list' | 'carousel';
    showIcons?: boolean;
    animation?: 'none' | 'count-up' | 'fade-in';
}

// Projects widget types
export interface Project {
    id: string | number;
    title: string;
    description?: string;
    image?: string;
    progress?: number;
    status?: string;
    link?: string;
}

export interface ProjectsOutputConfig {
    title?: string;
    projects?: Project[];
    limit?: number;
    columns?: number;
    showDescription?: boolean;
    showProgress?: boolean;
    showImage?: boolean;
    animation?: 'none' | 'fade' | 'slide' | 'zoom';
    hoverEffect?: 'none' | 'lift' | 'shadow' | 'scale';
    organization_id?: number;
    showHeaderActions?: boolean;
}

// Contact widget types
export interface ContactInfo {
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    social?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
    };
}

export interface ContactOutputConfig {
    title?: string;
    contactInfo?: ContactInfo;
}

// Menu widget types
export interface MenuItem {
    id: string | number;
    title: string;
    url: string;
    target?: '_blank' | '_self';
    children?: MenuItem[];
}

export interface MenuOutputConfig {
    title?: string;
    items?: MenuItem[];
    orientation?: 'row' | 'column';
    style?: 'default' | 'minimal' | 'modern';
}

// Form widget types
export interface FormField {
    id: string;
    type:
        | 'text'
        | 'email'
        | 'tel'
        | 'textarea'
        | 'select'
        | 'checkbox'
        | 'radio'
        | 'date'
        | 'file';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
}

export interface FormOutputConfig {
    title?: string;
    description?: string;
    fields?: FormField[];
    submitText?: string;
    successMessage?: string;
    styling?: Record<string, unknown>;
}

// Donation widget types
export interface DonationOutputConfig {
    title?: string;
    description?: string;
    minAmount?: number;
    maxAmount?: number;
    suggestedAmounts?: number[];
    currency?: string;
    paymentMethods?: string[];
    showProgress?: boolean;
    targetAmount?: number;
    currentAmount?: number;
    organizationId?: number;
}

// Donations list widget types
export interface DonationItem {
    id: string | number;
    donorName?: string;
    amount: number;
    currency: string;
    message?: string;
    date: string;
    isAnonymous?: boolean;
}

export interface DonationsListOutputConfig {
    title?: string;
    subtitle?: string;
    donations?: DonationItem[];
    limit?: number;
    showAmount?: boolean;
    showDate?: boolean;
    showMessage?: boolean;
    showDonorName?: boolean;
    organizationId?: number;
}

// City supporters widget types
export interface CitySupportersOutputConfig {
    title?: string;
    subtitle?: string;
    regions?: Array<{
        id: string | number;
        name: string;
        rating: number;
        votes: number;
        description?: string;
    }>;
    limit?: number;
    showVotes?: boolean;
    showDescription?: boolean;
    organizationId?: number;
}

// Referral leaderboard widget types
export interface ReferralLeaderboardOutputConfig {
    title?: string;
    subtitle?: string;
    leaderboard?: Array<{
        id: string | number;
        name: string;
        referrals: number;
        rank: number;
        avatar?: string;
    }>;
    limit?: number;
    showRank?: boolean;
    showAvatar?: boolean;
    organizationId?: number;
}
