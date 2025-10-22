import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Underline,
} from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

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

    // Реф для textarea
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Функция для применения форматирования
    const applyFormat = useCallback(
        (format: string) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = formData.content.substring(start, end);

            let formattedText = '';

            switch (format) {
                case 'bold':
                    formattedText = `**${selectedText}**`;
                    break;
                case 'italic':
                    formattedText = `*${selectedText}*`;
                    break;
                case 'underline':
                    formattedText = `__${selectedText}__`;
                    break;
                case 'align-left':
                    formattedText = `[left]${selectedText}[/left]`;
                    break;
                case 'align-center':
                    formattedText = `[center]${selectedText}[/center]`;
                    break;
                case 'align-right':
                    formattedText = `[right]${selectedText}[/right]`;
                    break;
                case 'ul': {
                    const lines = selectedText
                        .split('\n')
                        .filter((line) => line.trim());
                    formattedText = lines.map((line) => `• ${line}`).join('\n');
                    break;
                }
                case 'ol': {
                    const olLines = selectedText
                        .split('\n')
                        .filter((line) => line.trim());
                    formattedText = olLines
                        .map((line, index) => `${index + 1}. ${line}`)
                        .join('\n');
                    break;
                }
                case 'quote':
                    formattedText = `> ${selectedText}`;
                    break;
                default:
                    formattedText = selectedText;
            }

            const newContent =
                formData.content.substring(0, start) +
                formattedText +
                formData.content.substring(end);
            updateFormData('content', newContent);

            // Восстанавливаем фокус и позицию курсора
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(
                    start + formattedText.length,
                    start + formattedText.length,
                );
            }, 0);
        },
        [formData.content, updateFormData],
    );

    // Функция для форматирования предпросмотра
    const formatPreview = useCallback((text: string) => {
        if (!text) return '';

        return (
            text
                // Жирный текст
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                // Курсив
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                // Подчеркнутый
                .replace(/__(.*?)__/g, '<u>$1</u>')
                // Выравнивание
                .replace(
                    /\[left\](.*?)\[\/left\]/g,
                    '<div style="text-align: left;">$1</div>',
                )
                .replace(
                    /\[center\](.*?)\[\/center\]/g,
                    '<div style="text-align: center;">$1</div>',
                )
                .replace(
                    /\[right\](.*?)\[\/right\]/g,
                    '<div style="text-align: right;">$1</div>',
                )
                // Цитаты
                .replace(
                    /^> (.*$)/gm,
                    '<blockquote style="border-left: 4px solid #ccc; margin: 0; padding-left: 1rem; font-style: italic;">$1</blockquote>',
                )
                // Списки
                .replace(
                    /^• (.*$)/gm,
                    '<li style="list-style-type: disc; margin-left: 1rem;">$1</li>',
                )
                .replace(
                    /^\d+\. (.*$)/gm,
                    '<li style="list-style-type: decimal; margin-left: 1rem;">$1</li>',
                )
                // Переносы строк
                .replace(/\n/g, '<br>')
        );
    }, []);

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
                <div className="overflow-hidden rounded-lg border">
                    {/* Панель инструментов */}
                    <div className="flex flex-wrap gap-1 border-b bg-gray-50 p-2">
                        {/* Форматирование текста */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('bold')}
                            className="h-8 w-8 p-0"
                            title="Жирный"
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('italic')}
                            className="h-8 w-8 p-0"
                            title="Курсив"
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('underline')}
                            className="h-8 w-8 p-0"
                            title="Подчеркнутый"
                        >
                            <Underline className="h-4 w-4" />
                        </Button>

                        <div className="mx-1 h-6 w-px bg-gray-300" />

                        {/* Выравнивание */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('align-left')}
                            className="h-8 w-8 p-0"
                            title="По левому краю"
                        >
                            <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('align-center')}
                            className="h-8 w-8 p-0"
                            title="По центру"
                        >
                            <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('align-right')}
                            className="h-8 w-8 p-0"
                            title="По правому краю"
                        >
                            <AlignRight className="h-4 w-4" />
                        </Button>

                        <div className="mx-1 h-6 w-px bg-gray-300" />

                        {/* Списки */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('ul')}
                            className="h-8 w-8 p-0"
                            title="Маркированный список"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('ol')}
                            className="h-8 w-8 p-0"
                            title="Нумерованный список"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </Button>

                        <div className="mx-1 h-6 w-px bg-gray-300" />

                        {/* Цитата */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyFormat('quote')}
                            className="h-8 w-8 p-0"
                            title="Цитата"
                        >
                            <Quote className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Текстовое поле */}
                    <Textarea
                        ref={textareaRef}
                        id="text_content"
                        value={formData.content}
                        onChange={(e) =>
                            updateFormData('content', e.target.value)
                        }
                        placeholder="Введите текст..."
                        rows={8}
                        className="resize-none border-0 focus:ring-0"
                        style={{ minHeight: '200px' }}
                    />
                </div>

                {/* Предпросмотр */}
                {formData.content && (
                    <div className="mt-2">
                        <Label className="mb-2 block text-sm text-gray-600">
                            Предпросмотр:
                        </Label>
                        <div
                            className="rounded border bg-gray-50 p-3 text-sm"
                            dangerouslySetInnerHTML={{
                                __html: formatPreview(formData.content),
                            }}
                        />
                    </div>
                )}
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
