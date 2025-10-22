import { RichTextEditor } from '@/components/common/RichTextEditor';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import React, { useCallback, useMemo, useState } from 'react';

interface TextWidgetModalProps {
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
                } catch {
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

export const TextWidgetModal: React.FC<TextWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const baseConfig = useMemo(() => {
        console.log('TextWidgetModal - widget:', widget);
        console.log('TextWidgetModal - widget.configs:', widget.configs);
        console.log('TextWidgetModal - widget.config:', widget.config);

        const config = widget.configs
            ? convertConfigsToConfig(widget.configs)
            : widget.config || {};

        console.log('TextWidgetModal - baseConfig result:', config);
        return config;
    }, [widget]);

    const fromCfg = useMemo(() => {
        return (pendingConfig as Record<string, unknown>) || baseConfig;
    }, [pendingConfig, baseConfig]);

    const handleConfigUpdate = useCallback(
        (updates: Record<string, unknown>) => {
            console.log(
                'TextWidgetModal - handleConfigUpdate called with:',
                updates,
            );
            console.log(
                'TextWidgetModal - calling onConfigUpdate with:',
                updates,
            );
            onConfigUpdate(updates);
        },
        [onConfigUpdate],
    );

    // textarea больше не используется

    // Локальное состояние для формы
    const [formData, setFormData] = useState({
        title: (fromCfg.title as string) || '',
        content: (fromCfg.content as string) || '',
        fontSize: (fromCfg.fontSize as string) || 'medium',
        textAlign: (fromCfg.textAlign as 'left' | 'center' | 'right') || 'left',
        backgroundColor: (fromCfg.backgroundColor as string) || '',
        textColor: (fromCfg.textColor as string) || '',
        titleColor: (fromCfg.titleColor as string) || '',
        padding: (fromCfg.padding as string) || '',
        margin: (fromCfg.margin as string) || '',
        borderRadius: (fromCfg.borderRadius as string) || '',
        borderWidth: (fromCfg.borderWidth as string) || '',
        borderColor: (fromCfg.borderColor as string) || '',
        enableFormatting: (fromCfg.enableFormatting as boolean) || false,
        enableColors: (fromCfg.enableColors as boolean) || false,
    });

    // Обновляем локальное состояние при изменении fromCfg
    React.useEffect(() => {
        setFormData({
            title: (fromCfg.title as string) || '',
            content: (fromCfg.content as string) || '',
            fontSize: (fromCfg.fontSize as string) || 'medium',
            textAlign:
                (fromCfg.textAlign as 'left' | 'center' | 'right') || 'left',
            backgroundColor: (fromCfg.backgroundColor as string) || '',
            textColor: (fromCfg.textColor as string) || '',
            titleColor: (fromCfg.titleColor as string) || '',
            padding: (fromCfg.padding as string) || '',
            margin: (fromCfg.margin as string) || '',
            borderRadius: (fromCfg.borderRadius as string) || '',
            borderWidth: (fromCfg.borderWidth as string) || '',
            borderColor: (fromCfg.borderColor as string) || '',
            enableFormatting: (fromCfg.enableFormatting as boolean) || false,
            enableColors: (fromCfg.enableColors as boolean) || false,
        });
    }, [fromCfg]);

    const updateFormData = useCallback(
        (field: string, value: string | number | boolean) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));

            // Сразу обновляем конфиг
            handleConfigUpdate({
                ...formData,
                [field]: value,
            });
        },
        [formData, handleConfigUpdate],
    );

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="text_title">Заголовок</Label>
                <Input
                    id="text_title"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    placeholder="Введите заголовок"
                />
            </div>

            <div>
                <Label htmlFor="text_content">Содержимое</Label>
                <RichTextEditor
                    valueHTML={(formData.content as string) || ''}
                    onChangeHTML={(html) => updateFormData('content', html)}
                    minHeight={220}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="text_fontSize">Размер шрифта</Label>
                    <Select
                        value={formData.fontSize}
                        onValueChange={(value) =>
                            updateFormData('fontSize', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="small">Маленький</SelectItem>
                            <SelectItem value="medium">Средний</SelectItem>
                            <SelectItem value="large">Большой</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="text_textAlign">Выравнивание</Label>
                    <Select
                        value={formData.textAlign}
                        onValueChange={(value) =>
                            updateFormData('textAlign', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left">Слева</SelectItem>
                            <SelectItem value="center">По центру</SelectItem>
                            <SelectItem value="right">Справа</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="text_textColor">Цвет текста</Label>
                    <ColorPicker
                        value={formData.textColor}
                        onChange={(value) => updateFormData('textColor', value)}
                    />
                </div>

                <div>
                    <Label htmlFor="text_titleColor">Цвет заголовка</Label>
                    <ColorPicker
                        value={formData.titleColor}
                        onChange={(value) =>
                            updateFormData('titleColor', value)
                        }
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="text_backgroundColor">Цвет фона</Label>
                <ColorPicker
                    value={formData.backgroundColor}
                    onChange={(value) =>
                        updateFormData('backgroundColor', value)
                    }
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="text_padding">Отступы (px)</Label>
                    <Input
                        id="text_padding"
                        value={formData.padding}
                        onChange={(e) =>
                            updateFormData('padding', e.target.value)
                        }
                        placeholder="10"
                        type="number"
                    />
                </div>

                <div>
                    <Label htmlFor="text_margin">Внешние отступы (px)</Label>
                    <Input
                        id="text_margin"
                        value={formData.margin}
                        onChange={(e) =>
                            updateFormData('margin', e.target.value)
                        }
                        placeholder="0"
                        type="number"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="text_borderRadius">
                        Скругление углов (px)
                    </Label>
                    <Input
                        id="text_borderRadius"
                        value={formData.borderRadius}
                        onChange={(e) =>
                            updateFormData('borderRadius', e.target.value)
                        }
                        placeholder="0"
                        type="number"
                    />
                </div>

                <div>
                    <Label htmlFor="text_borderWidth">
                        Толщина границы (px)
                    </Label>
                    <Input
                        id="text_borderWidth"
                        value={formData.borderWidth}
                        onChange={(e) =>
                            updateFormData('borderWidth', e.target.value)
                        }
                        placeholder="0"
                        type="number"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="text_borderColor">Цвет границы</Label>
                <ColorPicker
                    value={formData.borderColor}
                    onChange={(value) => updateFormData('borderColor', value)}
                />
            </div>
        </div>
    );
};
