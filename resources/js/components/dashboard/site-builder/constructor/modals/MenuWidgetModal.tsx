import { Label } from '@/components/ui/label';
import { MenuWidget } from '@/components/dashboard/widgets/MenuWidget';
import React, { useCallback, useMemo } from 'react';

interface MenuWidgetModalProps {
    widget: {
        id: string;
        configs?: Array<{
            config_key: string;
            config_value: string;
            config_type: string;
        }>;
        config?: Record<string, unknown>;
        widget_slug: string;
        menu_items?: Array<{
            item_id?: string | number;
            id?: number;
            title: string;
            url: string;
            type: string;
            open_in_new_tab?: boolean;
            sort_order?: number;
            is_active?: boolean;
        }>;
    };
    pendingConfig: Record<string, unknown> | null;
    onConfigUpdate: (config: Record<string, unknown>) => void;
}

// Утилитарная функция для работы с configs
const convertConfigsToConfig = (configs: any[]): Record<string, unknown> => {
    if (!configs || configs.length === 0) return {};

    const config: any = {};
    configs.forEach((item) => {
        let value = item.config_value;

        switch (item.config_type) {
            case 'number':
                value = parseFloat(value);
                break;
            case 'boolean':
                value = value === '1' || value === 'true';
                break;
            case 'json':
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    console.warn(
                        'Failed to parse JSON config:',
                        item.config_key,
                        value,
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

export const MenuWidgetModal: React.FC<MenuWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    // Преобразуем menu_items в формат, ожидаемый MenuWidget
    const configsWithItems = useMemo(() => {
        const baseConfigs = widget.configs || [];
        const items = (widget.menu_items || []).map((mi) => ({
            id: String(mi.item_id || mi.id),
            title: mi.title,
            url: mi.url,
            type: mi.type as string as 'internal' | 'external',
            newTab: !!mi.open_in_new_tab,
        }));

        return items.length > 0
            ? [
                  ...baseConfigs,
                  {
                      config_key: 'items',
                      config_type: 'json',
                      config_value: JSON.stringify(items),
                  },
              ]
            : baseConfigs;
    }, [widget.configs, widget.menu_items]);

    const handleConfigChange = useCallback(
        (config: Record<string, unknown>) => {
            onConfigUpdate(config);
        },
        [onConfigUpdate],
    );

    return (
        <div className="space-y-4">
            <div className="rounded-lg border bg-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">
                    Настройки меню
                </h4>
                <div className="text-sm text-gray-600">
                    <Label>Редактирование элементов меню</Label>
                    <p className="mt-1 text-xs text-gray-500">
                        Используйте интерфейс ниже для добавления,
                        редактирования и удаления элементов меню. Изменения
                        сохраняются автоматически.
                    </p>
                </div>
            </div>

            <MenuWidget
                configs={configsWithItems as any}
                isEditable
                onConfigChange={handleConfigChange}
            />
        </div>
    );
};
