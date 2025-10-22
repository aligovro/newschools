import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type WidgetConfig } from '@/utils/widgetConfigUtils';
import React from 'react';

interface StandardWidgetFieldsProps {
    formData: {
        name: string;
        widget_slug: string;
        config: WidgetConfig;
        settings: Record<string, unknown>;
        is_active: boolean;
        is_visible: boolean;
    };
    onInputChange: (field: string, value: unknown) => void;
    onConfigUpdate: (config: WidgetConfig) => void;
}

export const StandardWidgetFields: React.FC<StandardWidgetFieldsProps> = ({
    formData,
    onInputChange,
    onConfigUpdate,
}) => {
    const handleJsonChange = (field: 'config' | 'settings', value: string) => {
        try {
            const parsed = JSON.parse(value);
            onInputChange(field, parsed);
            if (field === 'config') {
                onConfigUpdate(parsed as WidgetConfig);
            }
        } catch {
            // Invalid JSON - ignore silently
        }
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Название</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => onInputChange('name', e.target.value)}
                        placeholder="Введите название виджета"
                    />
                </div>
                <div>
                    <Label htmlFor="widget_slug">Widget Slug</Label>
                    <Input
                        id="widget_slug"
                        value={formData.widget_slug}
                        onChange={(e) =>
                            onInputChange('widget_slug', e.target.value)
                        }
                        placeholder="widget-slug"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) =>
                            onInputChange('is_active', e.target.checked)
                        }
                        className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_active">Активен</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="is_visible"
                        checked={formData.is_visible}
                        onChange={(e) =>
                            onInputChange('is_visible', e.target.checked)
                        }
                        className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_visible">Видимый</Label>
                </div>
            </div>

            <div>
                <Label htmlFor="config">Конфигурация (JSON)</Label>
                <Textarea
                    id="config"
                    value={JSON.stringify(formData.config, null, 2)}
                    onChange={(e) => handleJsonChange('config', e.target.value)}
                    placeholder="{}"
                    rows={4}
                    className="font-mono text-sm"
                />
            </div>

            <div>
                <Label htmlFor="settings">Настройки (JSON)</Label>
                <Textarea
                    id="settings"
                    value={JSON.stringify(formData.settings, null, 2)}
                    onChange={(e) =>
                        handleJsonChange('settings', e.target.value)
                    }
                    placeholder="{}"
                    rows={4}
                    className="font-mono text-sm"
                />
            </div>
        </>
    );
};
