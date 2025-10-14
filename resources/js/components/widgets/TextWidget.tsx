import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/ColorPicker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Bold,
    ChevronDown,
    ChevronUp,
    Italic,
    Link,
    List,
    ListOrdered,
    Quote,
    Settings,
    Type,
    Underline,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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
}

export const TextWidget: React.FC<TextWidgetProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
    onSave: _onSave,
    widgetId: _widgetId,
}) => {
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);
    const [localConfig, setLocalConfig] = useState(config);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const textareaRef = useRef<HTMLDivElement>(null);

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

    // Функции форматирования текста
    const insertFormatting = (format: string) => {
        if (!textareaRef.current) return;

        const editor = textareaRef.current;
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        if (!selection || !range) return;

        // Получаем выбранный текст
        const selectedText = selection.toString();

        switch (format) {
            case 'bold':
                if (selectedText) {
                    const strongElement = document.createElement('strong');
                    strongElement.textContent = selectedText;
                    range.deleteContents();
                    range.insertNode(strongElement);
                } else {
                    document.execCommand('bold');
                }
                break;

            case 'italic':
                if (selectedText) {
                    const emElement = document.createElement('em');
                    emElement.textContent = selectedText;
                    range.deleteContents();
                    range.insertNode(emElement);
                } else {
                    document.execCommand('italic');
                }
                break;

            case 'underline':
                if (selectedText) {
                    const uElement = document.createElement('u');
                    uElement.textContent = selectedText;
                    range.deleteContents();
                    range.insertNode(uElement);
                } else {
                    document.execCommand('underline');
                }
                break;

            case 'quote':
                if (selectedText) {
                    const blockquoteElement =
                        document.createElement('blockquote');
                    blockquoteElement.textContent = selectedText;
                    blockquoteElement.style.borderLeft = '4px solid #ccc';
                    blockquoteElement.style.paddingLeft = '16px';
                    blockquoteElement.style.fontStyle = 'italic';
                    blockquoteElement.style.margin = '16px 0';
                    range.deleteContents();
                    range.insertNode(blockquoteElement);
                } else {
                    const blockquoteElement =
                        document.createElement('blockquote');
                    blockquoteElement.innerHTML = '<br>';
                    blockquoteElement.style.borderLeft = '4px solid #ccc';
                    blockquoteElement.style.paddingLeft = '16px';
                    blockquoteElement.style.fontStyle = 'italic';
                    blockquoteElement.style.margin = '16px 0';
                    range.insertNode(blockquoteElement);
                }
                break;

            case 'heading':
                if (selectedText) {
                    const h1Element = document.createElement('h2');
                    h1Element.textContent = selectedText;
                    h1Element.style.fontSize = '1.5em';
                    h1Element.style.fontWeight = 'bold';
                    h1Element.style.margin = '16px 0 8px 0';
                    range.deleteContents();
                    range.insertNode(h1Element);
                } else {
                    const h1Element = document.createElement('h2');
                    h1Element.innerHTML = '<br>';
                    h1Element.style.fontSize = '1.5em';
                    h1Element.style.fontWeight = 'bold';
                    h1Element.style.margin = '16px 0 8px 0';
                    range.insertNode(h1Element);
                }
                break;

            case 'code':
                if (selectedText) {
                    const codeElement = document.createElement('code');
                    codeElement.textContent = selectedText;
                    codeElement.style.backgroundColor = '#f1f1f1';
                    codeElement.style.padding = '2px 4px';
                    codeElement.style.borderRadius = '3px';
                    codeElement.style.fontFamily = 'monospace';
                    range.deleteContents();
                    range.insertNode(codeElement);
                } else {
                    const codeElement = document.createElement('code');
                    codeElement.innerHTML = '<br>';
                    codeElement.style.backgroundColor = '#f1f1f1';
                    codeElement.style.padding = '2px 4px';
                    codeElement.style.borderRadius = '3px';
                    codeElement.style.fontFamily = 'monospace';
                    range.insertNode(codeElement);
                }
                break;

            case 'link':
                setShowLinkModal(true);
                return;
        }

        // Обновляем контент
        const htmlContent = editor.innerHTML;
        setLocalConfig((prev) => ({ ...prev, content: htmlContent }));

        // Восстанавливаем фокус
        editor.focus();
    };

    // Функция для создания ссылки
    const createLink = () => {
        if (!textareaRef.current || !linkUrl.trim()) return;

        const editor = textareaRef.current;
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        if (!selection || !range) return;

        const selectedText = selection.toString() || 'ссылка';
        const linkElement = document.createElement('a');
        linkElement.href = linkUrl;
        linkElement.textContent = selectedText;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.style.color = '#2563eb';
        linkElement.style.textDecoration = 'underline';

        if (selectedText) {
            range.deleteContents();
        }
        range.insertNode(linkElement);

        // Обновляем контент
        const htmlContent = editor.innerHTML;
        setLocalConfig((prev) => ({ ...prev, content: htmlContent }));

        // Закрываем модальное окно и сбрасываем URL
        setShowLinkModal(false);
        setLinkUrl('');

        // Восстанавливаем фокус
        editor.focus();
    };

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

                                        {/* Панель инструментов форматирования */}
                                        {enableFormatting && (
                                            <div className="mb-2 rounded-t-lg border border-gray-200 bg-gray-50 p-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {/* Форматирование текста */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            insertFormatting(
                                                                'bold',
                                                            )
                                                        }
                                                        title="Жирный текст"
                                                    >
                                                        <Bold className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            insertFormatting(
                                                                'italic',
                                                            )
                                                        }
                                                        title="Курсив"
                                                    >
                                                        <Italic className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            insertFormatting(
                                                                'underline',
                                                            )
                                                        }
                                                        title="Подчеркнутый текст"
                                                    >
                                                        <Underline className="h-4 w-4" />
                                                    </Button>

                                                    <div className="mx-1 h-6 w-px bg-gray-300" />

                                                    {/* Заголовки */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            insertFormatting(
                                                                'heading',
                                                            )
                                                        }
                                                        title="Заголовок"
                                                    >
                                                        <Type className="h-4 w-4" />
                                                    </Button>

                                                    <div className="mx-1 h-6 w-px bg-gray-300" />

                                                    {/* Списки */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            insertFormatting(
                                                                'list',
                                                            )
                                                        }
                                                        title="Маркированный список"
                                                    >
                                                        <List className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            insertFormatting(
                                                                'numbered-list',
                                                            )
                                                        }
                                                        title="Нумерованный список"
                                                    >
                                                        <ListOrdered className="h-4 w-4" />
                                                    </Button>

                                                    <div className="mx-1 h-6 w-px bg-gray-300" />

                                                    {/* Дополнительные элементы */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            insertFormatting(
                                                                'quote',
                                                            )
                                                        }
                                                        title="Цитата"
                                                    >
                                                        <Quote className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            insertFormatting(
                                                                'link',
                                                            )
                                                        }
                                                        title="Ссылка"
                                                    >
                                                        <Link className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            insertFormatting(
                                                                'code',
                                                            )
                                                        }
                                                        title="Строка кода"
                                                    >
                                                        <code className="text-xs">
                                                            {'<>'}
                                                        </code>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            ref={textareaRef}
                                            id="content"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onInput={(e) => {
                                                const htmlContent =
                                                    e.currentTarget.innerHTML;
                                                setLocalConfig((prev) => ({
                                                    ...prev,
                                                    content: htmlContent,
                                                }));
                                            }}
                                            className={`min-h-[200px] resize-none overflow-y-auto rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                                                enableFormatting
                                                    ? 'rounded-t-none'
                                                    : ''
                                            } transition-all duration-200`}
                                            style={{
                                                fontSize,
                                                color: textColor,
                                                backgroundColor:
                                                    backgroundColor ===
                                                    'transparent'
                                                        ? 'white'
                                                        : backgroundColor,
                                                borderColor: borderColor,
                                                borderRadius: borderRadius,
                                                padding: padding,
                                                textAlign: textAlign as
                                                    | 'left'
                                                    | 'center'
                                                    | 'right',
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    content || '<p><br></p>',
                                            }}
                                            data-placeholder="Введите текст... Используйте панель инструментов выше для форматирования."
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

                {/* Модальное окно для создания ссылки */}
                <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Добавить ссылку</DialogTitle>
                            <DialogDescription>
                                Введите URL для ссылки
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="linkUrl">URL</Label>
                                <Input
                                    id="linkUrl"
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowLinkModal(false);
                                        setLinkUrl('');
                                    }}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    onClick={createLink}
                                    disabled={!linkUrl.trim()}
                                >
                                    Добавить ссылку
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
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

            {/* Модальное окно для создания ссылки */}
            <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Добавить ссылку</DialogTitle>
                        <DialogDescription>
                            Введите URL для ссылки
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="linkUrl">URL</Label>
                            <Input
                                id="linkUrl"
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowLinkModal(false);
                                    setLinkUrl('');
                                }}
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={createLink}
                                disabled={!linkUrl.trim()}
                            >
                                Добавить ссылку
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
