import ImageUploader from '@/components/admin/settings/sites/ImageUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import React, { useCallback, useMemo } from 'react';

interface ImageWidgetModalProps {
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
const convertConfigsToConfig = (configs: any[]): Record<string, unknown> => {
    if (!configs || configs.length === 0) return {};

    const config: any = {};
    configs.forEach((item) => {
        let value = item.config_value;

        // Проверяем, что значение не пустое
        if (value === null || value === undefined || value === '') {
            return;
        }

        switch (item.config_type) {
            case 'number':
                value = parseFloat(value);
                break;
            case 'boolean':
                value = value === '1' || value === 'true';
                break;
            case 'json':
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    console.warn(
                        'Failed to parse JSON config:',
                        item.config_key,
                        value,
                    );
                    return; // Пропускаем некорректные JSON значения
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

export const ImageWidgetModal: React.FC<ImageWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const baseConfig = useMemo(() => {
        return widget.configs
            ? convertConfigsToConfig(widget.configs)
            : widget.config || {};
    }, [widget.configs, widget.config]);

    const fromCfg = useMemo(() => {
        return (pendingConfig as any) || baseConfig;
    }, [pendingConfig, baseConfig]);

    const imageUrl = fromCfg.image ? String(fromCfg.image) : '';
    const altText = fromCfg.altText ? String(fromCfg.altText) : '';
    const caption = fromCfg.caption ? String(fromCfg.caption) : '';
    const alignment = fromCfg.alignment ? String(fromCfg.alignment) : 'center';
    const size = fromCfg.size ? String(fromCfg.size) : 'medium';
    const linkUrl = fromCfg.linkUrl ? String(fromCfg.linkUrl) : '';
    const linkType = fromCfg.linkType ? String(fromCfg.linkType) : 'internal';
    const openInNewTab = Boolean(fromCfg.openInNewTab ?? false);

    const handleConfigUpdate = useCallback(
        (updates: Record<string, unknown>) => {
            // Объединяем текущую конфигурацию с обновлениями
            const newConfig = {
                ...fromCfg,
                ...updates,
            };
            onConfigUpdate(newConfig);
        },
        [fromCfg, onConfigUpdate],
    );

    return (
        <div className="space-y-4">
            <div>
                <ImageUploader
                    onImageUpload={(file, serverUrl) => {
                        const imageUrl = serverUrl || URL.createObjectURL(file);
                        handleConfigUpdate({
                            image: imageUrl,
                        });
                    }}
                    onImageCrop={(croppedUrl) => {
                        handleConfigUpdate({
                            image: croppedUrl,
                        });
                    }}
                    onImageDelete={() => {
                        handleConfigUpdate({
                            image: '',
                        });
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
                    existingImageUrl={imageUrl}
                    widgetSlug={widget.widget_slug}
                    imageType="image"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="image_alt">Alt текст</Label>
                    <Input
                        id="image_alt"
                        value={altText}
                        onChange={(e) =>
                            handleConfigUpdate({
                                altText: e.target.value,
                            })
                        }
                    />
                </div>
                <div>
                    <Label htmlFor="image_caption">Подпись</Label>
                    <Input
                        id="image_caption"
                        value={caption}
                        onChange={(e) =>
                            handleConfigUpdate({
                                caption: e.target.value,
                            })
                        }
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="image_alignment">Выравнивание</Label>
                    <Select
                        value={alignment}
                        onValueChange={(val) =>
                            handleConfigUpdate({
                                alignment: val,
                            })
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
                <div>
                    <Label htmlFor="image_size">Размер</Label>
                    <Select
                        value={size}
                        onValueChange={(val) =>
                            handleConfigUpdate({
                                size: val,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="small">Маленький</SelectItem>
                            <SelectItem value="medium">Средний</SelectItem>
                            <SelectItem value="large">Большой</SelectItem>
                            <SelectItem value="full">На всю ширину</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="image_link">Ссылка</Label>
                    <Input
                        id="image_link"
                        value={linkUrl}
                        onChange={(e) =>
                            handleConfigUpdate({
                                linkUrl: e.target.value,
                            })
                        }
                    />
                </div>
                <div>
                    <Label htmlFor="image_link_type">Тип ссылки</Label>
                    <Select
                        value={linkType}
                        onValueChange={(val) =>
                            handleConfigUpdate({
                                linkType: val,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="internal">Внутренняя</SelectItem>
                            <SelectItem value="external">Внешняя</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="ml-2 flex items-center space-x-2">
                <input
                    id="image_new_tab"
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) =>
                        handleConfigUpdate({
                            openInNewTab: e.target.checked,
                        })
                    }
                    className="rounded border-gray-300"
                />
                <Label htmlFor="image_new_tab">Открывать в новой вкладке</Label>
            </div>
        </div>
    );
};
