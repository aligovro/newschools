import { SchoolSubscribeWidget, SchoolSubscribeConfig } from '@/components/dashboard/widgets/SchoolSubscribeWidget';
import { WidgetData } from '@/components/dashboard/site-builder/types';
import {
    convertConfigsToConfig,
    type WidgetConfig,
} from '@/utils/widgetConfigUtils';
import React, { useCallback } from 'react';

interface SchoolSubscribeWidgetModalProps {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const SchoolSubscribeWidgetModal: React.FC<SchoolSubscribeWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const handleConfigUpdateAsync = useCallback(
        (updates: SchoolSubscribeConfig) => {
            onConfigUpdate(updates as WidgetConfig);
        },
        [onConfigUpdate],
    );

    const initialConfig = widget.configs
        ? convertConfigsToConfig(widget.configs)
        : widget.config || {};
    const subscribeConfig = pendingConfig ?? initialConfig;

    return (
        <SchoolSubscribeWidget
            config={subscribeConfig}
            isEditable
            onConfigChange={handleConfigUpdateAsync}
        />
    );
};
