import ImageUploader from '@/components/dashboard/settings/sites/ImageUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import { type WidgetConfig } from '@/utils/widgetConfigUtils';
import React from 'react';
import type { WidgetData } from '../types';

interface ColumnConfig {
    label: string;
    subtitle: string;
    icon: string;
    isVisible: boolean;
}

interface AlumniStatsWidgetModalProps {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const AlumniStatsWidgetModal: React.FC<AlumniStatsWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = pendingConfig || widget.config || {};

    // Получаем колонки из конфига или используем дефолтные
    const columns: ColumnConfig[] = config.columns || [
        {
            label: 'Поддерживают',
            subtitle: 'свои школы',
            icon: '',
            isVisible: true,
        },
        {
            label: 'Сумма поддержки',
            subtitle: 'бывшими выпускниками',
            icon: '',
            isVisible: true,
        },
        {
            label: 'Реализовали',
            subtitle: 'бывшие выпускники',
            icon: '',
            isVisible: true,
        },
    ];

    const handleChange = (key: string, value: any) => {
        onConfigUpdate({
            ...config,
            [key]: value,
        });
    };

    const handleColumnChange = (
        index: number,
        key: keyof ColumnConfig,
        value: any,
    ) => {
        const newColumns = [...columns];
        newColumns[index] = { ...newColumns[index], [key]: value };
        handleChange('columns', newColumns);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Общие настройки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TitleField
                        title={(config.title as string) || ''}
                        showTitle={(config.show_title as boolean) ?? true}
                        onTitleChange={(title) => handleChange('title', title)}
                        onShowTitleChange={(showTitle) =>
                            handleChange('show_title', showTitle)
                            }
                            placeholder="Например: Наша поддержка"
                        />

                    <div>
                        <Label htmlFor="organization_id">
                            ID организации (опционально)
                        </Label>
                        <Input
                            id="organization_id"
                            type="number"
                            value={(config.organization_id as number) || ''}
                            onChange={(e) => {
                                const value = e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined;
                                handleChange('organization_id', value);
                            }}
                            placeholder="Оставьте пустым для статистики по всем школам"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Для главного сайта оставьте пустым. Для сайта
                            организации укажите ID школы.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Настройка колонок</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {columns.map((column, index) => (
                        <div key={index}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">
                                        Колонка {index + 1}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={column.isVisible}
                                            onCheckedChange={(checked) =>
                                                handleColumnChange(
                                                    index,
                                                    'isVisible',
                                                    checked,
                                                )
                                            }
                                        />
                                        <Label className="text-xs">
                                            {column.isVisible
                                                ? 'Показана'
                                                : 'Скрыта'}
                                        </Label>
                                    </div>
                                </div>

                                <div>
                                    <Label>Заголовок</Label>
                                    <Input
                                        value={column.label}
                                        onChange={(e) =>
                                            handleColumnChange(
                                                index,
                                                'label',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Например: Поддерживают"
                                    />
                                </div>

                                <div>
                                    <Label>Подзаголовок</Label>
                                    <Input
                                        value={column.subtitle}
                                        onChange={(e) =>
                                            handleColumnChange(
                                                index,
                                                'subtitle',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Например: свои школы"
                                    />
                                </div>

                                <div>
                                    <Label>Иконка</Label>
                                    <ImageUploader
                                        onImageUpload={(file, serverUrl) => {
                                            const finalImageUrl =
                                                serverUrl ||
                                                URL.createObjectURL(file);
                                            handleColumnChange(
                                                index,
                                                'icon',
                                                finalImageUrl,
                                            );
                                        }}
                                        onImageCrop={(croppedUrl) => {
                                            handleColumnChange(
                                                index,
                                                'icon',
                                                croppedUrl,
                                            );
                                        }}
                                        onImageDelete={() => {
                                            handleColumnChange(
                                                index,
                                                'icon',
                                                '',
                                            );
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
                                        existingImageUrl={column.icon}
                                        widgetSlug="alumni_stats"
                                        imageType="image"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};
