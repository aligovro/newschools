import ImageUploader from '@/components/dashboard/settings/sites/ImageUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { convertConfigsToConfig } from '@/utils/widgetConfigUtils';
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
        return (pendingConfig as Record<string, unknown>) || baseConfig;
    }, [pendingConfig, baseConfig]);

    // Мемоизируем значения полей для предотвращения лишних перерендеров
    const fieldValues = useMemo(
        () => ({
            imageUrl: fromCfg.image !== undefined ? String(fromCfg.image) : '',
            altText:
                fromCfg.altText !== undefined ? String(fromCfg.altText) : '',
            caption:
                fromCfg.caption !== undefined ? String(fromCfg.caption) : '',
            alignment:
                fromCfg.alignment !== undefined
                    ? String(fromCfg.alignment)
                    : 'center',
            size: fromCfg.size !== undefined ? String(fromCfg.size) : 'medium',
            linkUrl:
                fromCfg.linkUrl !== undefined ? String(fromCfg.linkUrl) : '',
            linkType:
                fromCfg.linkType !== undefined
                    ? String(fromCfg.linkType)
                    : 'internal',
            openInNewTab: Boolean(fromCfg.openInNewTab ?? false),
        }),
        [fromCfg],
    );

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
                        const finalImageUrl =
                            serverUrl || URL.createObjectURL(file);
                        handleConfigUpdate({
                            image: finalImageUrl,
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
                    existingImageUrl={fieldValues.imageUrl}
                    widgetSlug={widget.widget_slug}
                    imageType="image"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="image_alt">Alt текст</Label>
                    <Input
                        id="image_alt"
                        value={fieldValues.altText}
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
                        value={fieldValues.caption}
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
                        value={fieldValues.alignment}
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
                        value={fieldValues.size}
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
                        value={fieldValues.linkUrl}
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
                        value={fieldValues.linkType}
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
                    checked={fieldValues.openInNewTab}
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
