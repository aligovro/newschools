/**
 * Утилитарные функции для работы с конфигурациями виджетов
 */

export type WidgetConfig = Record<string, unknown>;

export interface ConfigItem {
    config_key: string;
    config_value: string;
    config_type: string;
}

/**
 * Преобразует массив configs в объект config для совместимости
 * @param configs - массив конфигурационных элементов
 * @returns объект конфигурации
 */
export const convertConfigsToConfig = (configs: ConfigItem[]): WidgetConfig => {
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
                } catch (error) {
                    console.warn(
                        'Failed to parse JSON config:',
                        item.config_key,
                        item.config_value,
                    );
                }
                break;
            default:
                // string - оставляем как есть
                break;
        }

        config[item.config_key] = value;
    });

    return config;
};

/**
 * Получает значение из массива configs по ключу
 * @param configs - массив конфигурационных элементов
 * @param key - ключ для поиска
 * @param defaultValue - значение по умолчанию
 * @returns найденное значение или значение по умолчанию
 */
export const getConfigValue = (
    configs: ConfigItem[] | undefined,
    key: string,
    defaultValue: unknown = null,
): unknown => {
    if (!configs) return defaultValue;

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
