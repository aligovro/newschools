import { RegionRatingWidget } from '@/components/widgets/RegionRatingWidget';
import { type WidgetConfig } from '@/utils/widgetConfigUtils';
import { getOrganizationId } from '@/utils/widgetHelpers';
import React, { useCallback, useMemo } from 'react';
import type { WidgetData } from '../../types';

interface RegionRatingWidgetModalProps {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const RegionRatingWidgetModal: React.FC<
    RegionRatingWidgetModalProps
> = ({ widget, pendingConfig, onConfigUpdate }) => {
    // Получаем ID организации из конфигурации виджета
    const organizationId = useMemo(
        () => getOrganizationId(widget?.config),
        [widget?.config],
    );

    // Обертка для совместимости с RegionRatingWidget, ожидающим Promise
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
        <RegionRatingWidget
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
