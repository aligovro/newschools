import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import React, { useCallback, useMemo } from 'react';

interface AddOrganizationBlockWidgetModalProps {
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
                } catch (e) {
                    console.warn(
                        'Failed to parse JSON config:',
                        item.config_key,
                        value,
                    );
                }
                break;
            default:
                break;
        }
        config[item.config_key] = value;
    });
    return config;
};

export function AddOrganizationBlockWidgetModal({
    widget,
    pendingConfig,
    onConfigUpdate,
}: AddOrganizationBlockWidgetModalProps) {
    const currentConfig = useMemo(() => {
        if (pendingConfig) return pendingConfig;
        return widget.configs
            ? convertConfigsToConfig(widget.configs)
            : widget.config || {};
    }, [widget, pendingConfig]);

    const handleUpdate = useCallback(
        (key: string, value: unknown) => {
            const newConfig = {
                ...currentConfig,
                [key]: value,
            };
            onConfigUpdate(newConfig);
        },
        [currentConfig, onConfigUpdate],
    );

    const title =
        (currentConfig.title as string) || 'Не нашли свою школу?';
    const subtitle = (currentConfig.subtitle as string) || 'Добавляйте школу!';
    const description =
        (currentConfig.description as string) ||
        'Не оставляете школу без поддержки, вместе мы сможем обеспечить нужды школы и развить будущее поколение';
    const submitButtonText =
        (currentConfig.submitButtonText as string) || 'Добавить новую школу';
    const successMessage =
        (currentConfig.successMessage as string) ||
        'Школа успешно предложена! Мы рассмотрим вашу заявку в ближайшее время.';
    const errorMessage =
        (currentConfig.errorMessage as string) ||
        'Произошла ошибка при отправке формы. Попробуйте еще раз.';

    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-4 text-lg font-semibold">
                    Настройки блока добавления организации
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                    Этот виджет отображает форму для предложения новой
                    школы/организации. Используется только на главном сайте.
                </p>
            </div>

            <div className="space-y-4">
                <TitleField
                    title={title}
                    showTitle={(currentConfig.show_title as boolean) ?? true}
                    onTitleChange={(title) => handleUpdate('title', title)}
                    onShowTitleChange={(showTitle) =>
                        handleUpdate('show_title', showTitle)
                    }
                    placeholder="Не нашли свою школу?"
                />

                <div>
                    <Label htmlFor="subtitle" className="mb-2 block">
                        Подзаголовок
                    </Label>
                    <Input
                        id="subtitle"
                        value={subtitle}
                        onChange={(e) =>
                            handleUpdate('subtitle', e.target.value)
                        }
                        placeholder="Добавляйте школу!"
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="description" className="mb-2 block">
                        Описание
                    </Label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) =>
                            handleUpdate('description', e.target.value)
                        }
                        placeholder="Не оставляете школу без поддержки, вместе мы сможем обеспечить нужды школы и развить будущее поколение"
                        className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={3}
                    />
                </div>

                <div>
                    <Label htmlFor="submitButtonText" className="mb-2 block">
                        Текст кнопки отправки
                    </Label>
                    <Input
                        id="submitButtonText"
                        value={submitButtonText}
                        onChange={(e) =>
                            handleUpdate('submitButtonText', e.target.value)
                        }
                        placeholder="Добавить новую школу"
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="successMessage" className="mb-2 block">
                        Сообщение об успехе
                    </Label>
                    <textarea
                        id="successMessage"
                        value={successMessage}
                        onChange={(e) =>
                            handleUpdate('successMessage', e.target.value)
                        }
                        placeholder="Школа успешно предложена! Мы рассмотрим вашу заявку в ближайшее время."
                        className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={2}
                    />
                </div>

                <div>
                    <Label htmlFor="errorMessage" className="mb-2 block">
                        Сообщение об ошибке
                    </Label>
                    <textarea
                        id="errorMessage"
                        value={errorMessage}
                        onChange={(e) =>
                            handleUpdate('errorMessage', e.target.value)
                        }
                        placeholder="Произошла ошибка при отправке формы. Попробуйте еще раз."
                        className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={2}
                    />
                </div>
            </div>
        </div>
    );
}

