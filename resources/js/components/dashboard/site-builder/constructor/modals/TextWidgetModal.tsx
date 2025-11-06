import RichTextEditor from '@/components/RichTextEditor';
import { Label } from '@/components/ui/label';
import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
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
                    // Ошибка парсинга JSON - оставляем значение как есть
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

    // textarea больше не используется

    // Локальное состояние для формы
    const [formData, setFormData] = useState({
        title: (fromCfg.title as string) || '',
        content: (fromCfg.content as string) || '',
        show_title: (fromCfg.show_title as boolean) ?? true, // По умолчанию true для обратной совместимости
    });

    // Отслеживаем, активно ли редактируется контент
    const isContentEditingRef = React.useRef(false);
    const contentInitializedRef = React.useRef(false);
    const lastWidgetIdRef = React.useRef<string>(widget.id);
    const lastContentRef = React.useRef<string>('');

    // Сбрасываем инициализацию при смене виджета или изменении контента извне
    React.useEffect(() => {
        const currentContent = (fromCfg.content as string) || '';
        
        // Если виджет изменился, сбрасываем флаги
        if (lastWidgetIdRef.current !== widget.id) {
            lastWidgetIdRef.current = widget.id;
            contentInitializedRef.current = false;
            isContentEditingRef.current = false;
            lastContentRef.current = '';
        }
        
        // Если контент изменился извне (не от пользователя), сбрасываем флаг инициализации
        // чтобы загрузить новый контент в редактор
        if (lastContentRef.current !== currentContent && !isContentEditingRef.current) {
            contentInitializedRef.current = false;
            lastContentRef.current = currentContent;
        }
    }, [widget.id, fromCfg.content]);

    // Обновляем локальное состояние при изменении fromCfg
    // НЕ обновляем content, если он активно редактируется
    React.useEffect(() => {
        const currentContent = (fromCfg.content as string) || '';
        
        // Инициализация при первом открытии виджета или когда контент изменился извне
        if (!contentInitializedRef.current) {
            contentInitializedRef.current = true;
            lastContentRef.current = currentContent;
            setFormData((prev) => ({
                ...prev,
                title: (fromCfg.title as string) ?? prev.title,
                show_title: (fromCfg.show_title as boolean) ?? prev.show_title ?? true,
                content: currentContent,
            }));
            return;
        }

        // Обновляем только если контент не редактируется
        if (!isContentEditingRef.current) {
            // Проверяем, изменился ли контент извне
            if (lastContentRef.current !== currentContent) {
                lastContentRef.current = currentContent;
                // Сбрасываем флаг инициализации, чтобы загрузить новый контент
                contentInitializedRef.current = false;
            }
            
            setFormData((prev) => ({
                ...prev,
                title: (fromCfg.title as string) ?? prev.title,
                show_title: (fromCfg.show_title as boolean) ?? prev.show_title ?? true,
                // content обновляем только если не редактируется
                content: isContentEditingRef.current ? prev.content : currentContent,
            }));
        }
    }, [fromCfg]);

    const updateFormData = useCallback(
        (field: string, value: string | number | boolean) => {
            // Отслеживаем редактирование контента
            if (field === 'content') {
                isContentEditingRef.current = true;
            }

            setFormData((prev) => {
                const updated = {
                    ...prev,
                    [field]: value,
                };

                // Сразу обновляем конфиг
                handleConfigUpdate(updated);

                return updated;
            });

            // Сбрасываем флаг редактирования через небольшую задержку
            if (field === 'content') {
                setTimeout(() => {
                    isContentEditingRef.current = false;
                }, 300);
            }
        },
        [handleConfigUpdate],
    );

    return (
        <div className="space-y-4">
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
                <Label htmlFor="text_content">Содержимое</Label>
                <RichTextEditor
                    value={(formData.content as string) || ''}
                    onChange={(html) => updateFormData('content', html)}
                    height={220}
                    placeholder="Введите содержимое текстового блока..."
                    level="simple"
                    showHtmlToggle={true}
                    showTemplates={false}
                    showWordCount={true}
                    showImageUpload={true}
                />
            </div>
        </div>
    );
};
