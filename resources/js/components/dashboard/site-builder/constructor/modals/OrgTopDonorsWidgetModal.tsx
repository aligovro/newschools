import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { WidgetConfig } from '@/utils/widgetConfigUtils';
import React, { useCallback } from 'react';
import type { WidgetData } from '../../types';

const PERIOD_OPTIONS = [
    { value: 'week', label: 'За неделю' },
    { value: 'month', label: 'За месяц' },
    { value: 'all', label: 'За всё время' },
] as const;

type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value'];

interface Props {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const OrgTopDonorsWidgetModal: React.FC<Props> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = (pendingConfig || widget.config || {}) as Record<
        string,
        unknown
    >;
    const period = (config.period as PeriodValue) || 'all';
    const limit = Math.max(1, Math.min(50, Number(config.limit ?? 10)));
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
                        Топ поддержавших выпусков — настройки
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
                        placeholder="Топ поддержавших выпусков"
                    />
                    <div className="space-y-2">
                        <Label>Период по умолчанию</Label>
                        <Select
                            value={period}
                            onValueChange={(v) =>
                                handleChange({ period: v as PeriodValue })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PERIOD_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="org-top-donors-limit">
                            Количество записей (1–50)
                        </Label>
                        <Input
                            id="org-top-donors-limit"
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
                                                e.target.value || '10',
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
