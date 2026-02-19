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

export const OrgTopRecurringDonorsWidgetModal: React.FC<Props> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = (pendingConfig || widget.config || {}) as Record<
        string,
        unknown
    >;
    const limit = Math.max(1, Math.min(50, Number(config.limit ?? 15)));
    const title = (config.title as string) ?? '';

    const handleChange = useCallback(
        (updates: Record<string, unknown>) => {
            onConfigUpdate({ ...config, ...updates } as WidgetConfig);
        },
        [config, onConfigUpdate],
    );

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">
                        Топ регулярно-поддерживающих — настройки
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TitleField
                        title={title}
                        showTitle={(config.show_title as boolean) ?? true}
                        onTitleChange={(t) => handleChange({ title: t })}
                        onShowTitleChange={(show) =>
                            handleChange({ show_title: show })
                        }
                        placeholder="Топ регулярно-поддерживающих"
                    />
                    <div className="space-y-2">
                        <Label htmlFor="org-top-recurring-limit">
                            Количество записей (1–50)
                        </Label>
                        <Input
                            id="org-top-recurring-limit"
                            type="number"
                            min={1}
                            max={50}
                            value={limit}
                            onChange={(e) =>
                                handleChange({
                                    limit: Math.max(
                                        1,
                                        Math.min(
                                            50,
                                                parseInt(
                                                e.target.value || '15',
                                                10,
                                            ),
                                        ),
                                    ),
                                })
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
