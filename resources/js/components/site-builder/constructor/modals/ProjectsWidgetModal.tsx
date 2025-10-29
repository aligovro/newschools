import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { type WidgetConfig } from '@/utils/widgetConfigUtils';
import React, { useCallback } from 'react';
import type { WidgetData } from '../../types';

interface ProjectsWidgetModalProps {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const ProjectsWidgetModal: React.FC<ProjectsWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = (pendingConfig || widget.config || {}) as Record<
        string,
        unknown
    >;

    const update = useCallback(
        (patch: Record<string, unknown>) => {
            onConfigUpdate({
                ...config,
                ...patch,
            } as WidgetConfig);
        },
        [config, onConfigUpdate],
    );

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">
                        Проекты — настройки отображения
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="title">Заголовок</Label>
                        <Input
                            id="title"
                            value={String(config.title ?? 'Проекты школ')}
                            onChange={(e) => update({ title: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="limit">Количество</Label>
                        <Input
                            id="limit"
                            type="number"
                            min={1}
                            max={12}
                            value={Number(config.limit ?? 6)}
                            onChange={(e) =>
                                update({
                                    limit: Math.max(
                                        1,
                                        Math.min(
                                            12,
                                            parseInt(e.target.value || '0', 10),
                                        ),
                                    ),
                                })
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="columns">Колонки</Label>
                        <Input
                            id="columns"
                            type="number"
                            min={1}
                            max={4}
                            value={Number(config.columns ?? 3)}
                            onChange={(e) =>
                                update({
                                    columns: Math.max(
                                        1,
                                        Math.min(
                                            4,
                                            parseInt(e.target.value || '0', 10),
                                        ),
                                    ),
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Показывать описание</Label>
                            <p className="text-xs text-gray-500">
                                Короткое описание под заголовком
                            </p>
                        </div>
                        <Switch
                            checked={Boolean(config.showDescription ?? true)}
                            onCheckedChange={(v) =>
                                update({ showDescription: v })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Показывать прогресс</Label>
                            <p className="text-xs text-gray-500">
                                Шкала прогресса и суммы
                            </p>
                        </div>
                        <Switch
                            checked={Boolean(config.showProgress ?? true)}
                            onCheckedChange={(v) => update({ showProgress: v })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Показывать изображение</Label>
                        </div>
                        <Switch
                            checked={Boolean(config.showImage ?? true)}
                            onCheckedChange={(v) => update({ showImage: v })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="organization_id">
                            ID организации (опционально)
                        </Label>
                        <Input
                            id="organization_id"
                            type="number"
                            value={String(config.organization_id ?? '')}
                            onChange={(e) => {
                                const val = e.target.value.trim();
                                update({
                                    organization_id:
                                        val === '' ? undefined : Number(val),
                                });
                            }}
                            placeholder="Пусто — все школы"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
