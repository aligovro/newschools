import { Card, CardContent } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/RichTextEditor';
import { getConfigValue, WidgetConfig } from '@/utils/getConfigValue';
import {
    ChevronDown,
    ChevronUp,
    Settings,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface TextWidgetProps {
    config?: {
        title?: string;
        content?: string;
        fontSize?: string;
        textAlign?: 'left' | 'center' | 'right';
        backgroundColor?: string;
        textColor?: string;
        titleColor?: string;
        padding?: string;
        margin?: string;
        borderRadius?: string;
        borderWidth?: string;
        borderColor?: string;
        enableFormatting?: boolean;
        enableColors?: boolean;
    };
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    widgetId?: string;
    // Поддержка configs для нормализованных данных
    configs?: WidgetConfig[];
    styling?: Record<string, any>;
}

export const TextWidget: React.FC<TextWidgetProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
    onSave: _onSave,
    widgetId: _widgetId,
    configs,
    styling,
}) => {
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);

    // Извлекаем значения из configs если они переданы
    const configValues = configs
        ? {
              title: getConfigValue(configs, 'title', config.title),
              content: getConfigValue(configs, 'content', config.content),
              fontSize: getConfigValue(configs, 'fontSize', config.fontSize),
              textAlign: getConfigValue(configs, 'textAlign', config.textAlign),
              backgroundColor: getConfigValue(
                  configs,
                  'backgroundColor',
                  config.backgroundColor,
              ),
              textColor: getConfigValue(configs, 'textColor', config.textColor),
              titleColor: getConfigValue(
                  configs,
                  'titleColor',
                  config.titleColor,
              ),
              padding: getConfigValue(configs, 'padding', config.padding),
              margin: getConfigValue(configs, 'margin', config.margin),
              borderRadius: getConfigValue(
                  configs,
                  'borderRadius',
                  config.borderRadius,
              ),
              borderWidth: getConfigValue(
                  configs,
                  'borderWidth',
                  config.borderWidth,
              ),
              borderColor: getConfigValue(
                  configs,
                  'borderColor',
                  config.borderColor,
              ),
              enableFormatting: getConfigValue(
                  configs,
                  'enableFormatting',
                  config.enableFormatting,
              ),
              enableColors: getConfigValue(
                  configs,
                  'enableColors',
                  config.enableColors,
              ),
          }
        : config;

    const [localConfig, setLocalConfig] = useState(configValues);

    // Синхронизируем локальное состояние с внешним config
    useEffect(() => {
        setLocalConfig(configValues);
    }, [config, configs]);

    // Обновляем состояние при изменении autoExpandSettings
    useEffect(() => {
        if (autoExpandSettings) {
            setIsSettingsExpanded(true);
        }
    }, [autoExpandSettings, isSettingsExpanded]);


    const {
        title = 'Заголовок',
        content = 'Содержимое текстового блока',
        fontSize = '16px',
        textAlign = 'left',
        backgroundColor = 'transparent',
        textColor = '#000000',
        titleColor = '#000000',
        padding = '16px',
        margin = '0px',
        borderRadius = '8px',
        borderWidth = '0px',
        borderColor = '#e5e7eb',
        enableFormatting = true,
        enableColors = true,
    } = localConfig;

    // Функция для рендеринга форматированного текста
    const renderFormattedText = (text: string) => {
        if (!enableFormatting) return text;

        return (
            text
                // Обрабатываем HTML теги с добавлением CSS классов
                .replace(
                    /<strong>(.*?)<\/strong>/g,
                    '<strong class="font-bold">$1</strong>',
                )
                .replace(/<em>(.*?)<\/em>/g, '<em class="italic">$1</em>')
                .replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>')
                .replace(
                    /<h2>(.*?)<\/h2>/g,
                    '<h2 class="text-xl font-semibold mb-3">$1</h2>',
                )
                .replace(
                    /<h3>(.*?)<\/h3>/g,
                    '<h3 class="text-lg font-semibold mb-2">$1</h3>',
                )
                .replace(
                    /<blockquote>(.*?)<\/blockquote>/g,
                    '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700">$1</blockquote>',
                )
                .replace(
                    /<a href="([^"]*)"[^>]*>(.*?)<\/a>/g,
                    '<a href="$1" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$2</a>',
                )
                .replace(
                    /<code>(.*?)<\/code>/g,
                    '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>',
                )
                .replace(
                    /<pre><code>(.*?)<\/code><\/pre>/g,
                    '<pre class="bg-gray-100 p-3 rounded overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>',
                )
                .replace(
                    /<li>(.*?)<\/li>/g,
                    '<li class="ml-4 list-disc">$1</li>',
                )
                // Переносы строк
                .replace(/\n/g, '<br>')
        );
    };

    if (isEditable) {
        return (
            <>
                <div className="text-widget-editor">
                    <Card>
                        <CardContent className="p-6">
                            {/* Кнопка для переключения настроек */}
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Текстовый блок
                                </h3>
                                <div className="flex items-center space-x-2">
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
                                            className="transition-all duration-200"
                                            style={{
                                                fontSize: `calc(${fontSize} * 1.25)`,
                                                color: titleColor,
                                                backgroundColor:
                                                    backgroundColor ===
                                                    'transparent'
                                                        ? 'white'
                                                        : backgroundColor,
                                                borderColor: borderColor,
                                                textAlign: textAlign as
                                                    | 'left'
                                                    | 'center'
                                                    | 'right',
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="content">
                                            Содержимое
                                        </Label>
                                        <RichTextEditor
                                            value={content || ''}
                                            onChange={(html) =>
                                                setLocalConfig((prev) => ({
                                                    ...prev,
                                                    content: html,
                                                }))
                                            }
                                            height={220}
                                            placeholder="Введите содержимое текстового блока..."
                                            level="simple"
                                            showHtmlToggle={true}
                                            showTemplates={false}
                                            showWordCount={true}
                                            showImageUpload={false}
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

                                    {/* Настройки цветов */}
                                    {enableColors && (
                                        <div className="space-y-4 border-t pt-4">
                                            <h4 className="font-medium">
                                                Цвета и стили
                                            </h4>

                                            <div className="grid grid-cols-1 gap-4">
                                                <ColorPicker
                                                    label="Цвет текста"
                                                    value={textColor}
                                                    onChange={(color) =>
                                                        setLocalConfig(
                                                            (prev) => ({
                                                                ...prev,
                                                                textColor:
                                                                    color,
                                                            }),
                                                        )
                                                    }
                                                />

                                                <ColorPicker
                                                    label="Цвет заголовка"
                                                    value={titleColor}
                                                    onChange={(color) =>
                                                        setLocalConfig(
                                                            (prev) => ({
                                                                ...prev,
                                                                titleColor:
                                                                    color,
                                                            }),
                                                        )
                                                    }
                                                />

                                                <ColorPicker
                                                    label="Цвет фона"
                                                    value={backgroundColor}
                                                    onChange={(color) =>
                                                        setLocalConfig(
                                                            (prev) => ({
                                                                ...prev,
                                                                backgroundColor:
                                                                    color,
                                                            }),
                                                        )
                                                    }
                                                />

                                                <ColorPicker
                                                    label="Цвет границы"
                                                    value={borderColor}
                                                    onChange={(color) =>
                                                        setLocalConfig(
                                                            (prev) => ({
                                                                ...prev,
                                                                borderColor:
                                                                    color,
                                                            }),
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Отступы (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={parseInt(
                                                            padding,
                                                        )}
                                                        onChange={(e) =>
                                                            setLocalConfig(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    padding: `${e.target.value}px`,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <Label>
                                                        Внешние отступы (px)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={parseInt(margin)}
                                                        onChange={(e) =>
                                                            setLocalConfig(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    margin: `${e.target.value}px`,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <Label>
                                                        Скругление (px)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={parseInt(
                                                            borderRadius,
                                                        )}
                                                        onChange={(e) =>
                                                            setLocalConfig(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    borderRadius: `${e.target.value}px`,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>
                                                    Толщина границы (px)
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={parseInt(
                                                        borderWidth,
                                                    )}
                                                    onChange={(e) =>
                                                        setLocalConfig(
                                                            (prev) => ({
                                                                ...prev,
                                                                borderWidth: `${e.target.value}px`,
                                                            }),
                                                        )
                                                    }
                                                    className="w-32"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Настройки функций */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-medium">Функции</h4>

                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={enableFormatting}
                                                    onChange={(e) =>
                                                        setLocalConfig(
                                                            (prev) => ({
                                                                ...prev,
                                                                enableFormatting:
                                                                    e.target
                                                                        .checked,
                                                            }),
                                                        )
                                                    }
                                                    className="rounded"
                                                />
                                                <span>
                                                    Включить форматирование
                                                    текста
                                                </span>
                                            </label>

                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={enableColors}
                                                    onChange={(e) =>
                                                        setLocalConfig(
                                                            (prev) => ({
                                                                ...prev,
                                                                enableColors:
                                                                    e.target
                                                                        .checked,
                                                            }),
                                                        )
                                                    }
                                                    className="rounded"
                                                />
                                                <span>
                                                    Включить настройки цветов
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </>
        );
    }

    // Режим просмотра
    return (
        <>
            <div
                className="text-widget"
                style={{
                    backgroundColor,
                    color: textColor,
                    padding,
                    margin,
                    borderRadius,
                    borderWidth:
                        borderWidth !== '0px' ? borderWidth : undefined,
                    borderColor:
                        borderWidth !== '0px' ? borderColor : undefined,
                    borderStyle: borderWidth !== '0px' ? 'solid' : undefined,
                    // Применяем стили из styling
                    ...(styling || {}),
                }}
            >
                <h4
                    className="mb-2 font-semibold"
                    style={{
                        fontSize,
                        textAlign,
                        color: titleColor,
                    }}
                >
                    {title}
                </h4>
                <div
                    style={{
                        fontSize,
                        textAlign,
                        color: textColor,
                    }}
                    dangerouslySetInnerHTML={{
                        __html: renderFormattedText(content),
                    }}
                />
            </div>

        </>
    );
};
