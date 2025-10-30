import { Label } from '@/components/ui/label';
import { FormWidget } from '@/components/dashboard/widgets/FormWidget';
import React, { useCallback, useMemo } from 'react';

interface FormWidgetModalProps {
    widget: {
        id: string;
        configs?: Array<{
            config_key: string;
            config_value: string;
            config_type: string;
        }>;
        config?: Record<string, unknown>;
        widget_slug: string;
        name?: string;
        is_active?: boolean;
        order?: number;
        created_at?: string;
        updated_at?: string;
    };
    pendingConfig: Record<string, unknown> | null;
    onConfigUpdate: (config: Record<string, unknown>) => void;
    siteId?: number;
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

export const FormWidgetModal: React.FC<FormWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
    siteId = 0,
}) => {
    // Преобразуем виджет в формат, ожидаемый FormWidget
    const formWidget = useMemo(() => {
        const config = widget.configs
            ? convertConfigsToConfig(widget.configs)
            : widget.config || {};

        console.log('FormWidgetModal - widget:', widget);
        console.log('FormWidgetModal - config:', config);
        console.log('FormWidgetModal - fields from config:', config.fields);

        return {
            id: parseInt(widget.id),
            site_id: siteId,
            name: widget.name || '',
            widget_slug: widget.widget_slug as 'form',
            description: (config.description as string) || '',
            settings: (config.settings || {}) as Record<string, unknown>,
            styling: (config.styling || {}) as Record<string, unknown>,
            fields: (config.fields || []) as any[],
            actions: (config.actions || []) as any[],
            css_class: (config.css_class as string) || '',
            is_active: widget.is_active ?? true,
            sort_order: widget.order || 0,
            created_at: widget.created_at || '',
            updated_at: widget.updated_at || '',
        };
    }, [widget, siteId]);

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
                    Настройки формы
                </h4>
                <div className="text-sm text-gray-600">
                    <Label>Редактирование формы</Label>
                    <p className="mt-1 text-xs text-gray-500">
                        Используйте интерфейс ниже для настройки полей формы,
                        действий и стилизации. Изменения сохраняются
                        автоматически.
                    </p>
                </div>
            </div>

            <FormWidget
                widget={formWidget}
                isEditable
                onConfigChange={handleConfigChange}
            />
        </div>
    );
};
