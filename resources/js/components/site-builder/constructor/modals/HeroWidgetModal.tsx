import { HeroWidget } from '@/components/widgets/HeroWidgetRefactored';
import {
    convertConfigsToConfig,
    type WidgetConfig,
} from '@/utils/widgetConfigUtils';
import React, { useCallback } from 'react';
import type { WidgetData } from '../../types';

interface HeroWidgetModalProps {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const HeroWidgetModal: React.FC<HeroWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    // Обертка для совместимости с HeroWidget, ожидающим Promise
    const handleConfigUpdateAsync = useCallback(
        async (updates: WidgetConfig) => {
            onConfigUpdate(updates);
        },
        [onConfigUpdate],
    );

    // Получаем конфигурацию из configs или config
    const heroConfig = widget.configs
        ? convertConfigsToConfig(widget.configs)
        : pendingConfig || widget.config || {};

    return (
        <HeroWidget
            config={heroConfig}
            isEditable
            autoExpandSettings
            onConfigChange={handleConfigUpdateAsync}
            configs={widget.configs}
            styling={widget.config?.styling as Record<string, any>}
            hero_slides={widget.hero_slides}
        />
    );
};
