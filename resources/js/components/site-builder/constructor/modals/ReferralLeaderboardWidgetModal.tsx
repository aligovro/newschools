import { ReferralLeaderboardWidget } from '@/components/widgets/ReferralLeaderboardWidget';
import { type WidgetConfig } from '@/utils/widgetConfigUtils';
import { getOrganizationId } from '@/utils/widgetHelpers';
import React, { useCallback, useMemo } from 'react';
import type { WidgetData } from '../../types';

interface ReferralLeaderboardWidgetModalProps {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const ReferralLeaderboardWidgetModal: React.FC<
    ReferralLeaderboardWidgetModalProps
> = ({ widget, pendingConfig, onConfigUpdate }) => {
    // Получаем ID организации из конфигурации виджета
    const organizationId = useMemo(
        () => getOrganizationId(widget?.config),
        [widget?.config],
    );

    // Обертка для совместимости с ReferralLeaderboardWidget, ожидающим Promise
    const handleConfigUpdateAsync = useCallback(
        async (updates: WidgetConfig) => {
            onConfigUpdate(updates);
        },
        [onConfigUpdate],
    );

    // Обертка для onConfigChange (синхронная)
    const handleConfigChange = useCallback(
        (config: WidgetConfig) => {
            onConfigUpdate(config);
        },
        [onConfigUpdate],
    );

    return (
        <ReferralLeaderboardWidget
            config={pendingConfig || widget.config || {}}
            isEditable
            autoExpandSettings
            onSave={handleConfigUpdateAsync}
            onConfigChange={handleConfigChange}
            widgetId={widget.id}
            organizationId={organizationId}
        />
    );
};
