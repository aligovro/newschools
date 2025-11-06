import { ColorPicker } from '@/components/ui/ColorPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Code, Eye, Settings } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

interface HtmlWidgetModalProps {
    widget: {
        id: string;
        configs?: Array<{
            config_key: string;
            config_value: string;
            config_type: string;
        }>;
        config?: Record<string, unknown>;
    };
    pendingConfig: Record<string, unknown> | null;
    onConfigUpdate: (updates: Record<string, unknown>) => void;
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

export const HtmlWidgetModal: React.FC<HtmlWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const baseConfig = useMemo(() => {
        const config = widget.configs
            ? convertConfigsToConfig(widget.configs)
            : widget.config || {};

        return config;
    }, [widget]);

    const fromCfg = useMemo(() => {
        return (pendingConfig as Record<string, unknown>) || baseConfig;
    }, [pendingConfig, baseConfig]);

    const handleConfigUpdate = useCallback(
        (updates: Record<string, unknown>) => {
            onConfigUpdate(updates);
        },
        [onConfigUpdate],
    );

    // Локальное состояние для формы
    const [formData, setFormData] = useState({
        title: (fromCfg.title as string) || '',
        show_title: (fromCfg.show_title as boolean) ?? true, // По умолчанию true для обратной совместимости
        htmlContent: (fromCfg.htmlContent as string) || '',
        enableScripts: (fromCfg.enableScripts as boolean) || true,
        enableStyles: (fromCfg.enableStyles as boolean) || true,
        width: (fromCfg.width as string) || '',
        height: (fromCfg.height as string) || '',
        backgroundColor: (fromCfg.backgroundColor as string) || '',
        padding: (fromCfg.padding as string) || '',
        margin: (fromCfg.margin as string) || '',
        borderRadius: (fromCfg.borderRadius as string) || '',
        borderWidth: (fromCfg.borderWidth as string) || '',
        borderColor: (fromCfg.borderColor as string) || '',
    });

    // Обновляем локальное состояние при изменении fromCfg
    React.useEffect(() => {
        setFormData({
            title: (fromCfg.title as string) || '',
            show_title: (fromCfg.show_title as boolean) ?? true,
            htmlContent: (fromCfg.htmlContent as string) || '',
            enableScripts: (fromCfg.enableScripts as boolean) || true,
            enableStyles: (fromCfg.enableStyles as boolean) || true,
            width: (fromCfg.width as string) || '',
            height: (fromCfg.height as string) || '',
            backgroundColor: (fromCfg.backgroundColor as string) || '',
            padding: (fromCfg.padding as string) || '',
            margin: (fromCfg.margin as string) || '',
            borderRadius: (fromCfg.borderRadius as string) || '',
            borderWidth: (fromCfg.borderWidth as string) || '',
            borderColor: (fromCfg.borderColor as string) || '',
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

    // Проверка HTML на безопасность
    const validateHtml = useCallback(
        (html: string) => {
            const warnings: string[] = [];

            // Проверка на потенциально опасные теги
            if (html.includes('<script') && !formData.enableScripts) {
                warnings.push('Обнаружены скрипты, но они будут отключены');
            }

            if (html.includes('<style') && !formData.enableStyles) {
                warnings.push('Обнаружены стили, но они будут отключены');
            }

            // Проверка на iframe
            if (html.includes('<iframe')) {
                warnings.push(
                    'Обнаружен iframe - убедитесь в безопасности источника',
                );
            }

            return warnings;
        },
        [formData.enableScripts, formData.enableStyles],
    );

    const warnings = validateHtml(formData.htmlContent);

    return (
        <div className="space-y-4">
            <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                        value="content"
                        className="flex items-center gap-2"
                    >
                        <Code className="h-4 w-4" />
                        HTML код
                    </TabsTrigger>
                    <TabsTrigger
                        value="preview"
                        className="flex items-center gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        Предпросмотр
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="flex items-center gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        Настройки
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                    <TitleField
                        title={formData.title}
                        showTitle={formData.show_title}
                        onTitleChange={(title) => updateFormData('title', title)}
                        onShowTitleChange={(showTitle) =>
                            updateFormData('show_title', showTitle)
                            }
                            placeholder="Введите заголовок"
                        />

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <Label htmlFor="html_content">HTML код</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="enable_scripts"
                                        checked={formData.enableScripts}
                                        onCheckedChange={(checked) =>
                                            updateFormData(
                                                'enableScripts',
                                                checked,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="enable_scripts"
                                        className="text-sm"
                                    >
                                        Разрешить скрипты
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="enable_styles"
                                        checked={formData.enableStyles}
                                        onCheckedChange={(checked) =>
                                            updateFormData(
                                                'enableStyles',
                                                checked,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="enable_styles"
                                        className="text-sm"
                                    >
                                        Разрешить стили
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {warnings.length > 0 && (
                            <div className="mb-2 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                                <div className="mb-2 flex items-center gap-2 text-yellow-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="font-medium">
                                        Предупреждения:
                                    </span>
                                </div>
                                <ul className="space-y-1 text-sm text-yellow-700">
                                    {warnings.map((warning, index) => (
                                        <li key={index}>• {warning}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Textarea
                            id="html_content"
                            value={formData.htmlContent}
                            onChange={(e) =>
                                updateFormData('htmlContent', e.target.value)
                            }
                            placeholder="Вставьте HTML код..."
                            rows={12}
                            className="font-mono text-sm"
                        />

                        <div className="mt-2 text-xs text-gray-500">
                            Поддерживаются: HTML теги, CSS стили, JavaScript
                            скрипты, iframe
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                    <div className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span className="font-medium">Предпросмотр</span>
                        </div>

                        {formData.htmlContent ? (
                            <div
                                className="html-preview rounded border bg-white p-3"
                                dangerouslySetInnerHTML={{
                                    __html: formData.htmlContent,
                                }}
                            />
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                Введите HTML код для предпросмотра
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="html_width">Ширина</Label>
                            <Input
                                id="html_width"
                                value={formData.width}
                                onChange={(e) =>
                                    updateFormData('width', e.target.value)
                                }
                                placeholder="100%, 300px, auto"
                            />
                        </div>

                        <div>
                            <Label htmlFor="html_height">Высота</Label>
                            <Input
                                id="html_height"
                                value={formData.height}
                                onChange={(e) =>
                                    updateFormData('height', e.target.value)
                                }
                                placeholder="200px, 100vh, auto"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="html_backgroundColor">Цвет фона</Label>
                        <ColorPicker
                            value={formData.backgroundColor}
                            onChange={(value) =>
                                updateFormData('backgroundColor', value)
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="html_padding">
                                Внутренние отступы (px)
                            </Label>
                            <Input
                                id="html_padding"
                                value={formData.padding}
                                onChange={(e) =>
                                    updateFormData('padding', e.target.value)
                                }
                                placeholder="10"
                                type="number"
                            />
                        </div>

                        <div>
                            <Label htmlFor="html_margin">
                                Внешние отступы (px)
                            </Label>
                            <Input
                                id="html_margin"
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
                            <Label htmlFor="html_borderRadius">
                                Скругление углов (px)
                            </Label>
                            <Input
                                id="html_borderRadius"
                                value={formData.borderRadius}
                                onChange={(e) =>
                                    updateFormData(
                                        'borderRadius',
                                        e.target.value,
                                    )
                                }
                                placeholder="0"
                                type="number"
                            />
                        </div>

                        <div>
                            <Label htmlFor="html_borderWidth">
                                Толщина границы (px)
                            </Label>
                            <Input
                                id="html_borderWidth"
                                value={formData.borderWidth}
                                onChange={(e) =>
                                    updateFormData(
                                        'borderWidth',
                                        e.target.value,
                                    )
                                }
                                placeholder="0"
                                type="number"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="html_borderColor">Цвет границы</Label>
                        <ColorPicker
                            value={formData.borderColor}
                            onChange={(value) =>
                                updateFormData('borderColor', value)
                            }
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
