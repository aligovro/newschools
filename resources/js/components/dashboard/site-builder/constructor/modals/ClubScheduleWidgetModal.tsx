import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WidgetConfig } from '@/utils/widgetConfigUtils';
import React, { useCallback } from 'react';
import type { WidgetData } from '../../types';

interface Props {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const ClubScheduleWidgetModal: React.FC<Props> = ({
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
                <CardContent>
                    <TitleField
                        title={
                            (config.title as string) ||
                            'Расписание кружков и секций'
                        }
                        showTitle={(config.show_title as boolean) ?? true}
                        onTitleChange={(title) => handleChange('title', title)}
                        onShowTitleChange={(showTitle) =>
                            handleChange('show_title', showTitle)
                        }
                        placeholder="Расписание кружков и секций"
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default ClubScheduleWidgetModal;
