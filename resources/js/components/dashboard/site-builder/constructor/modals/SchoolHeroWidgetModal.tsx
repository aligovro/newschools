import { SchoolHeroWidget } from '@/components/dashboard/widgets/SchoolHeroWidget';
import { WidgetData } from '@/components/dashboard/site-builder/types';
import {
    convertConfigsToConfig,
    type WidgetConfig,
} from '@/utils/widgetConfigUtils';
import React, { useCallback } from 'react';

interface SchoolHeroWidgetModalProps {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const SchoolHeroWidgetModal: React.FC<SchoolHeroWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const handleConfigUpdateAsync = useCallback(
        (updates: WidgetConfig) => {
            onConfigUpdate(updates);
        },
        [onConfigUpdate],
    );

    const initialConfig = widget.configs
        ? convertConfigsToConfig(widget.configs)
        : widget.config || {};
    const heroConfig = pendingConfig ?? initialConfig;

    return (
        <SchoolHeroWidget
            config={heroConfig}
            isEditable
            onConfigChange={handleConfigUpdateAsync}
            css_class={widget.css_class}
            styling={widget.config?.styling as React.CSSProperties}
        />
    );
};
