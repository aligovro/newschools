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
}

export interface HeroConfig {
    type?: 'single' | 'slider';
    height?: string;
    animation?: 'fade' | 'slide' | 'zoom';
    autoplay?: boolean;
    autoplayDelay?: number;
    showDots?: boolean;
    showArrows?: boolean;
    slides?: HeroSlide[];
    singleSlide?: HeroSlide;
    css_class?: string;
}

export interface HeroWidgetProps {
    config?: HeroConfig;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    widgetId?: string;
    onConfigChange?: (config: Record<string, unknown>) => void;
    css_class?: string;
}
