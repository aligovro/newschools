/**
 * Тип для конфигурации виджета
 */
export type WidgetConfig = {
    config_key: string;
    config_value: string;
    config_type: string;
};

/**
 * Утилитарная функция для работы с configs (нормализованными данными виджетов)
 * @param configs - массив конфигураций из базы данных
 * @param key - ключ конфигурации
 * @param defaultValue - значение по умолчанию
 * @returns значение конфигурации с правильным типом
 */
export const getConfigValue = (
    configs: WidgetConfig[] | undefined,
    key: string,
    defaultValue: any = null,
) => {
    if (!configs || !Array.isArray(configs)) return defaultValue;

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
            } catch (e) {
                console.warn(
                    `Failed to parse JSON config for key "${key}":`,
                    config.config_value,
                );
                return defaultValue;
            }
        default:
            return config.config_value;
    }
};
