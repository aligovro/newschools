import { DonationWidget } from '@/components/widgets/DonationWidget';
import { type WidgetConfig } from '@/utils/widgetConfigUtils';
import { getOrganizationId } from '@/utils/widgetHelpers';
import React, { useCallback, useMemo } from 'react';
import type { WidgetData } from '../../types';

interface DonationWidgetModalProps {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const DonationWidgetModal: React.FC<DonationWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    // Получаем ID организации из конфигурации виджета
    const organizationId = useMemo(
        () => getOrganizationId(widget?.config),
        [widget?.config],
    );

    // Обертка для совместимости с DonationWidget, ожидающим Promise
    const handleConfigUpdateAsync = useCallback(
        async (updates: WidgetConfig) => {
            onConfigUpdate(updates);
        },
        [onConfigUpdate],
    );

    return (
        <DonationWidget
            config={pendingConfig || widget.config || {}}
            isEditable
            autoExpandSettings
            onSave={handleConfigUpdateAsync}
            widgetId={widget.id}
            organizationId={organizationId}
        />
    );
};
