import ImageUploader from '@/components/dashboard/settings/sites/ImageUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useCallback, useMemo } from 'react';

interface SubscribeBlockWidgetModalProps {
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

export function SubscribeBlockWidgetModal({
    widget,
    pendingConfig,
    onConfigUpdate,
}: SubscribeBlockWidgetModalProps) {
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

    const mainTitle =
        (currentConfig.mainTitle as string) ||
        'Подпишись на постоянную поддержку своей школы';
    const subtitle =
        (currentConfig.subtitle as string) ||
        'Подписка поможет закрывать регулярные нужды школы и реализовывать проекты';
    const backgroundGradient =
        (currentConfig.backgroundGradient as string) ||
        'linear-gradient(84deg, #96bdff 0%, #3259ff 100%)';
    const backgroundImage =
        (currentConfig.backgroundImage as string) || '';
    const schoolsLimit = Number(currentConfig.schoolsLimit || 6);
    const columns = Number(currentConfig.columns || 3);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-4 text-lg font-semibold">
                    Настройки блока подписки
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                    Этот виджет отображает блок поиска и подписки на популярные
                    школы. Используется только на главном сайте. Терминология
                    берется из глобальных настроек.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="mainTitle" className="mb-2 block">
                        Заголовок
                    </Label>
                    <Input
                        id="mainTitle"
                        value={mainTitle}
                        onChange={(e) =>
                            handleUpdate('mainTitle', e.target.value)
                        }
                        placeholder="Подпишись на постоянную поддержку своей школы"
                        className="mt-1"
                    />
                </div>

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
                        placeholder="Подписка поможет закрывать регулярные нужды школы и реализовывать проекты"
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="backgroundImage" className="mb-2 block">
                        Фоновая картинка
                    </Label>
                    <ImageUploader
                        onImageUpload={(file, serverUrl) => {
                            const finalImageUrl =
                                serverUrl || URL.createObjectURL(file);
                            handleUpdate('backgroundImage', finalImageUrl);
                        }}
                        onImageCrop={(croppedUrl) => {
                            handleUpdate('backgroundImage', croppedUrl);
                        }}
                        onImageDelete={() => {
                            handleUpdate('backgroundImage', '');
                        }}
                        acceptedTypes={[
                            'image/jpeg',
                            'image/png',
                            'image/gif',
                            'image/webp',
                            'image/svg+xml',
                        ]}
                        aspectRatio={undefined}
                        enableServerUpload={true}
                        existingImageUrl={backgroundImage}
                        widgetSlug={widget.widget_slug}
                        imageType="background"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        Если загружена фоновая картинка, она будет использоваться
                        вместо картинки по умолчанию
                    </p>
                </div>

                <div>
                    <Label htmlFor="backgroundGradient" className="mb-2 block">
                        Градиент фона (CSS)
                    </Label>
                    <Input
                        id="backgroundGradient"
                        value={backgroundGradient}
                        onChange={(e) =>
                            handleUpdate('backgroundGradient', e.target.value)
                        }
                        placeholder="linear-gradient(84deg, #96bdff 0%, #3259ff 100%)"
                        className="mt-1 font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Формат: linear-gradient(направление, цвет1 позиция, цвет2
                        позиция)
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="schoolsLimit" className="mb-2 block">
                            Количество школ
                        </Label>
                        <Input
                            id="schoolsLimit"
                            type="number"
                            min={1}
                            max={12}
                            value={schoolsLimit}
                            onChange={(e) =>
                                handleUpdate(
                                    'schoolsLimit',
                                    Math.max(
                                        1,
                                        Math.min(
                                            12,
                                            parseInt(e.target.value || '0', 10),
                                        ),
                                    ),
                                )
                            }
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="columns" className="mb-2 block">
                            Количество колонок
                        </Label>
                        <Input
                            id="columns"
                            type="number"
                            min={1}
                            max={4}
                            value={columns}
                            onChange={(e) =>
                                handleUpdate(
                                    'columns',
                                    Math.max(
                                        1,
                                        Math.min(
                                            4,
                                            parseInt(e.target.value || '0', 10),
                                        ),
                                    ),
                                )
                            }
                            className="mt-1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

