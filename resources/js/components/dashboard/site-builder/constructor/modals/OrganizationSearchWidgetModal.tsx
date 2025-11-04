import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import React, { useCallback, useMemo } from 'react';

interface OrganizationSearchWidgetModalProps {
    widget: {
        id: string;
        configs?: Array<{
            config_key: string;
            config_value: string;
            config_type: string;
        }>;
        config?: Record<string, unknown>;
        widget_slug: string;
    };
    pendingConfig: Record<string, unknown> | null;
    onConfigUpdate: (config: Record<string, unknown>) => void;
}

// Утилитарная функция для работы с configs
const convertConfigsToConfig = (
    configs: Array<{
        config_key: string;
        config_value: string;
        config_type: string;
    }>,
): Record<string, unknown> => {
    if (!configs || configs.length === 0) return {};

    const config: Record<string, unknown> = {};
    configs.forEach((item) => {
        let value: unknown = item.config_value;

        switch (item.config_type) {
            case 'number':
                value = parseFloat(value as string);
                break;
            case 'boolean':
                value = value === '1' || value === 'true';
                break;
            case 'json':
                try {
                    value = JSON.parse(value as string);
                } catch (e) {
                    console.warn(
                        'Failed to parse JSON config:',
                        item.config_key,
                        value,
                    );
                }
                break;
            default:
                break;
        }
        config[item.config_key] = value;
    });
    return config;
};

export function OrganizationSearchWidgetModal({
    widget,
    pendingConfig,
    onConfigUpdate,
}: OrganizationSearchWidgetModalProps) {
    const currentConfig = useMemo(() => {
        if (pendingConfig) return pendingConfig;
        return widget.configs
            ? convertConfigsToConfig(widget.configs)
            : widget.config || {};
    }, [widget, pendingConfig]);

    const handleUpdate = useCallback(
        (key: string, value: unknown) => {
            const newConfig = {
                ...currentConfig,
                [key]: value,
            };
            onConfigUpdate(newConfig);
        },
        [currentConfig, onConfigUpdate],
    );

    const placeholder =
        (currentConfig.placeholder as string) ||
        'Поиск по названию, адресу школы...';
    const resultsLimit = Number(currentConfig.resultsLimit || 10);
    const showCitySelector = currentConfig.showCitySelector !== false;
    const emptyMessage =
        (currentConfig.emptyMessage as string) || 'Организации не найдены';

    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-4 text-lg font-semibold">
                    Настройки поиска организаций
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                    Виджет поиска организаций (школ) с автодополнением и
                    выпадающим списком результатов. Используется только на
                    главном сайте. Терминология берется из глобальных настроек.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="placeholder" className="mb-2 block">
                        Плейсхолдер поиска
                    </Label>
                    <Input
                        id="placeholder"
                        value={placeholder}
                        onChange={(e) =>
                            handleUpdate('placeholder', e.target.value)
                        }
                        placeholder="Поиск по названию, адресу школы..."
                        className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Текст, который отображается в поле поиска до ввода
                    </p>
                </div>

                <div>
                    <Label htmlFor="resultsLimit" className="mb-2 block">
                        Максимальное количество результатов
                    </Label>
                    <Input
                        id="resultsLimit"
                        type="number"
                        min={5}
                        max={50}
                        value={resultsLimit}
                        onChange={(e) =>
                            handleUpdate(
                                'resultsLimit',
                                Math.max(
                                    5,
                                    Math.min(
                                        50,
                                        parseInt(e.target.value || '10', 10),
                                    ),
                                ),
                            )
                        }
                        className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Количество результатов, отображаемых в выпадающем
                        списке (от 5 до 50)
                    </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="showCitySelector" className="text-base">
                            Показывать селектор города
                        </Label>
                        <p className="text-sm text-gray-600">
                            Отображать выпадающий список для выбора города
                        </p>
                    </div>
                    <Switch
                        id="showCitySelector"
                        checked={showCitySelector}
                        onCheckedChange={(checked) =>
                            handleUpdate('showCitySelector', checked)
                        }
                    />
                </div>

                <div>
                    <Label htmlFor="emptyMessage" className="mb-2 block">
                        Сообщение при отсутствии результатов
                    </Label>
                    <Input
                        id="emptyMessage"
                        value={emptyMessage}
                        onChange={(e) =>
                            handleUpdate('emptyMessage', e.target.value)
                        }
                        placeholder="Организации не найдены"
                        className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Текст, который отображается, когда поиск не дал
                        результатов
                    </p>
                </div>
            </div>
        </div>
    );
}
