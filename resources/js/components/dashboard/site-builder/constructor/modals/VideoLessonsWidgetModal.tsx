import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WidgetConfig } from '@/utils/widgetConfigUtils';
import React, { useCallback } from 'react';
import type { WidgetData } from '../../types';

interface Props {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const VideoLessonsWidgetModal: React.FC<Props> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = (pendingConfig || widget.config || {}) as Record<
        string,
        unknown
    >;

    const handleChange = useCallback(
        (key: string, value: unknown) => {
            onConfigUpdate({
                ...config,
                [key]: value,
            });
        },
        [config, onConfigUpdate],
    );

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Настройки виджета</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TitleField
                        title={(config.title as string) || 'Видео уроки'}
                        showTitle={(config.show_title as boolean) ?? true}
                        onTitleChange={(title) => handleChange('title', title)}
                        onShowTitleChange={(showTitle) =>
                            handleChange('show_title', showTitle)
                        }
                        placeholder="Видео уроки"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="limit">Количество</Label>
                            <Input
                                id="limit"
                                type="number"
                                min={4}
                                max={50}
                                value={Number(config.limit ?? 12)}
                                onChange={(e) =>
                                    handleChange(
                                        'limit',
                                        Math.max(
                                            4,
                                            Math.min(
                                                50,
                                                parseInt(
                                                    e.target.value || '12',
                                                    10,
                                                ),
                                            ),
                                        ),
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="columns">Колонок в сетке</Label>
                            <Input
                                id="columns"
                                type="number"
                                min={1}
                                max={4}
                                value={Number(config.columns ?? 3)}
                                onChange={(e) =>
                                    handleChange(
                                        'columns',
                                        Math.max(
                                            1,
                                            Math.min(
                                                4,
                                                parseInt(
                                                    e.target.value || '3',
                                                    10,
                                                ),
                                            ),
                                        ),
                                    )
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default VideoLessonsWidgetModal;
