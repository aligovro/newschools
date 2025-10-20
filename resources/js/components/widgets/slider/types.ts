export interface SliderSlide {
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
    // Дополнительные поля для универсального слайдера
    content?: string; // HTML контент
    image?: string; // Основное изображение
    link?: string; // Ссылка на весь слайд
    order?: number; // Порядок сортировки
}

export interface SliderConfig {
    // Основные настройки
    type?: 'hero' | 'carousel' | 'gallery';
    layout?: 'fullwidth' | 'grid'; // Полная ширина или сетка
    slidesPerView?: number; // Количество слайдов в строке (для grid)
    height?: string;

    // Анимация и поведение
    animation?: 'fade' | 'slide' | 'zoom' | 'flip' | 'cube';
    autoplay?: boolean;
    autoplayDelay?: number;
    loop?: boolean;

    // Навигация
    showDots?: boolean;
    showArrows?: boolean;
    showProgress?: boolean;

    // Настройки сетки
    spaceBetween?: number; // Отступ между слайдами
    breakpoints?: {
        [key: number]: {
            slidesPerView: number;
            spaceBetween: number;
        };
    };

    // Стилизация
    css_class?: string;
    slides?: SliderSlide[];
    singleSlide?: SliderSlide;
}

export interface SliderWidgetProps {
    config?: SliderConfig;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    widgetId?: string;
    onConfigChange?: (config: Record<string, unknown>) => void;
    css_class?: string;
    // Поддержка configs для нормализованных данных
    configs?: WidgetConfig[];
    styling?: Record<string, unknown>;
    // Слайды из специализированной таблицы
    slider_slides?: SliderSlide[];
}

export type WidgetConfig = {
    config_key: string;
    config_value: string;
    config_type: string;
};
