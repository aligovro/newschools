// Глобальные типы для разрешения any в определенных местах

declare global {
    // Разрешаем any для внешних библиотек и API ответов
    type AnyObject = Record<string, any>;
    type AnyFunction = (...args: any[]) => any;
    type AnyArray = any[];

    // Для API ответов от Laravel
    interface ApiResponse<T = any> {
        success: boolean;
        data: T;
        message?: string;
        errors?: Record<string, string[]>;
    }

    // Для конфигураций виджетов
    interface WidgetConfig {
        [key: string]: any;
    }

    // Для настроек виджетов
    interface WidgetSettings {
        [key: string]: any;
    }

    // Для layout конфигураций
    interface LayoutConfig {
        [key: string]: any;
    }

    // Для theme конфигураций
    interface ThemeConfig {
        [key: string]: any;
    }
}

export {};
