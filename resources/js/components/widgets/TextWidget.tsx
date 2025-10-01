import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SaveButton } from '@/components/ui/SaveButton';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface TextWidgetProps {
    config?: {
        title?: string;
        content?: string;
        fontSize?: string;
        textAlign?: 'left' | 'center' | 'right';
    };
    isEditable?: boolean;
    autoExpandSettings?: boolean;
}

export const TextWidget: React.FC<TextWidgetProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
}) => {
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);
    const [localConfig, setLocalConfig] = useState(config);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<
        'idle' | 'saving' | 'saved' | 'error'
    >('idle');

    // Синхронизируем локальное состояние с внешним config
    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    // Обновляем состояние при изменении autoExpandSettings
    useEffect(() => {
        if (autoExpandSettings) {
            setIsSettingsExpanded(true);
        }
    }, [autoExpandSettings, isSettingsExpanded]);

    // Функция сохранения конфигурации
    const handleSave = async () => {
        if (isSaving) return;

        setIsSaving(true);
        setSaveStatus('saving');

        try {
            // Здесь будет API вызов для сохранения
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Error saving widget config:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const {
        title = 'Заголовок',
        content = 'Содержимое текстового блока',
        fontSize = '16px',
        textAlign = 'left',
    } = localConfig;

    if (isEditable) {
        return (
            <div className="text-widget-editor">
                <Card>
                    <CardContent className="p-6">
                        {/* Кнопка для переключения настроек */}
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Текстовый блок
                            </h3>
                            <div className="flex items-center space-x-2">
                                {isSettingsExpanded && (
                                    <SaveButton
                                        onSave={handleSave}
                                        isSaving={isSaving}
                                        saveStatus={saveStatus}
                                        size="sm"
                                        label="Сохранить"
                                        savedLabel="✓ Сохранено"
                                        errorLabel="✗ Ошибка"
                                        savingLabel="Сохранение..."
                                    />
                                )}
                                <button
                                    onClick={() =>
                                        setIsSettingsExpanded(
                                            !isSettingsExpanded,
                                        )
                                    }
                                    className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Настройки</span>
                                    {isSettingsExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Настройки */}
                        {isSettingsExpanded && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Заголовок</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) =>
                                            setLocalConfig((prev) => ({
                                                ...prev,
                                                title: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="content">Содержимое</Label>
                                    <Textarea
                                        id="content"
                                        value={content}
                                        onChange={(e) =>
                                            setLocalConfig((prev) => ({
                                                ...prev,
                                                content: e.target.value,
                                            }))
                                        }
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="fontSize">
                                            Размер шрифта (px)
                                        </Label>
                                        <Input
                                            id="fontSize"
                                            type="number"
                                            value={parseInt(fontSize)}
                                            onChange={(e) =>
                                                setLocalConfig((prev) => ({
                                                    ...prev,
                                                    fontSize: `${e.target.value}px`,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="textAlign">
                                            Выравнивание
                                        </Label>
                                        <select
                                            id="textAlign"
                                            value={textAlign}
                                            onChange={(e) =>
                                                setLocalConfig((prev) => ({
                                                    ...prev,
                                                    textAlign: e.target
                                                        .value as
                                                        | 'left'
                                                        | 'center'
                                                        | 'right',
                                                }))
                                            }
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="left">
                                                По левому краю
                                            </option>
                                            <option value="center">
                                                По центру
                                            </option>
                                            <option value="right">
                                                По правому краю
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {/* Кнопка сохранения */}
                                <div className="mt-6 flex justify-end">
                                    <SaveButton
                                        onSave={handleSave}
                                        isSaving={isSaving}
                                        saveStatus={saveStatus}
                                        label="Сохранить настройки"
                                        savedLabel="✓ Настройки сохранены"
                                        errorLabel="✗ Ошибка сохранения"
                                        savingLabel="Сохранение..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Предварительный просмотр */}
                        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h4
                                className="mb-2 font-semibold"
                                style={{ fontSize, textAlign }}
                            >
                                {title}
                            </h4>
                            <p style={{ fontSize, textAlign }}>{content}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Режим просмотра
    return (
        <div className="text-widget">
            <h4 className="mb-2 font-semibold" style={{ fontSize, textAlign }}>
                {title}
            </h4>
            <p style={{ fontSize, textAlign }}>{content}</p>
        </div>
    );
};
