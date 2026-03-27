import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import ImageUploader from '@/components/dashboard/settings/sites/ImageUploader';
import { GOAL_PERIODS, type GoalPeriod } from '@/lib/goal-periods';
import React, { useEffect, useState } from 'react';

export interface SchoolHeroConfig {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    overlayOpacity?: number;
    /** Показывать ли блок периодической цели */
    showMonthlyGoal?: boolean;
    /** Период цели (по умолчанию 'monthly') */
    goalPeriod?: GoalPeriod;
    /** Переопределение цели (в рублях) — приоритет над API */
    monthlyGoalTarget?: number;
    showTotalProgress?: boolean;
    organizationId?: number;
}

export interface SchoolHeroWidgetProps {
    config?: SchoolHeroConfig;
    isEditable?: boolean;
    onConfigChange?: (config: SchoolHeroConfig) => void;
    css_class?: string;
    styling?: React.CSSProperties;
}

export const SchoolHeroWidget: React.FC<SchoolHeroWidgetProps> = ({
    config = {},
    isEditable = false,
    onConfigChange,
}) => {
    const [localConfig, setLocalConfig] = useState<SchoolHeroConfig>({
        title: config.title || 'Гимназия №107',
        subtitle: config.subtitle || 'Поддерживай свою школу — поддержи будущее поколение',
        backgroundImage: config.backgroundImage || '',
        overlayOpacity: config.overlayOpacity ?? 80,
        showMonthlyGoal: config.showMonthlyGoal ?? true,
        goalPeriod: config.goalPeriod ?? 'monthly',
        monthlyGoalTarget: config.monthlyGoalTarget,
        showTotalProgress: config.showTotalProgress ?? true,
        organizationId: config.organizationId,
    });

    useEffect(() => {
        setLocalConfig((prev) => ({ ...prev, ...config }));
    }, [config]);

    const handleChange = (key: keyof SchoolHeroConfig, value: any) => {
        const newConfig = { ...localConfig, [key]: value };
        setLocalConfig(newConfig);
        onConfigChange?.(newConfig);
    };

    if (!isEditable) {
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                Школьный баннер (настройка доступна в режиме редактирования)
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Заголовок</Label>
                    <Input
                        value={localConfig.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Например: Гимназия №107"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Подзаголовок</Label>
                    <Input
                        value={localConfig.subtitle || ''}
                        onChange={(e) => handleChange('subtitle', e.target.value)}
                        placeholder="Например: Поддерживай свою школу..."
                    />
                </div>

                <div className="space-y-2">
                    <Label>Фоновое изображение</Label>
                    <ImageUploader
                        existingImageUrl={localConfig.backgroundImage}
                        onImageUpload={(file, serverUrl) => {
                            if (serverUrl && !serverUrl.startsWith('blob:')) {
                                // Сохраняем только путь без домена (/storage/...)
                                const path = serverUrl.startsWith('http')
                                    ? serverUrl.replace(/^https?:\/\/[^/]+/, '')
                                    : serverUrl;
                                handleChange('backgroundImage', path);
                            }
                        }}
                        onImageCrop={(url) => {
                            if (!url.startsWith('blob:')) {
                                const path = url.startsWith('http')
                                    ? url.replace(/^https?:\/\/[^/]+/, '')
                                    : url;
                                handleChange('backgroundImage', path);
                            }
                        }}
                        onImageDelete={() => handleChange('backgroundImage', '')}
                        aspectRatio={16 / 9}
                        widgetSlug="school_hero"
                        enableServerUpload={true}
                    />
                </div>

                <div className="space-y-2">
                    <Label>ID Организации (опционально, для данных сборов)</Label>
                    <Input
                        type="number"
                        value={localConfig.organizationId || ''}
                        onChange={(e) =>
                            handleChange(
                                'organizationId',
                                e.target.value ? parseInt(e.target.value) : undefined
                            )
                        }
                        placeholder="Оставьте пустым для автоопределения"
                    />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Периодическая цель</Label>
                        <p className="text-sm text-gray-500">
                            Отображать блок с целью на период (месяц / неделю)
                        </p>
                    </div>
                    <Switch
                        checked={localConfig.showMonthlyGoal}
                        onCheckedChange={(checked) =>
                            handleChange('showMonthlyGoal', checked)
                        }
                    />
                </div>

                {localConfig.showMonthlyGoal && (
                    <>
                        <div className="space-y-2">
                            <Label>Период цели</Label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={localConfig.goalPeriod ?? 'monthly'}
                                onChange={(e) =>
                                    handleChange('goalPeriod', e.target.value as GoalPeriod)
                                }
                            >
                                {GOAL_PERIODS.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Цель (₽) — переопределяет значение из API</Label>
                            <Input
                                type="number"
                                min={0}
                                value={localConfig.monthlyGoalTarget ?? ''}
                                onChange={(e) =>
                                    handleChange(
                                        'monthlyGoalTarget',
                                        e.target.value ? Number(e.target.value) : undefined,
                                    )
                                }
                                placeholder="Оставьте пустым — значение из системы"
                            />
                        </div>
                    </>
                )}

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Общий прогресс</Label>
                        <p className="text-sm text-gray-500">
                            Отображать общий прогресс сборов (собрано/необходимо)
                        </p>
                    </div>
                    <Switch
                        checked={localConfig.showTotalProgress}
                        onCheckedChange={(checked) =>
                            handleChange('showTotalProgress', checked)
                        }
                    />
                </div>
            </div>
        </div>
    );
};
