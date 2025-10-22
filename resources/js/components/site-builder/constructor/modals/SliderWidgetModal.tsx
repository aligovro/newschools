import { SliderWidget } from '@/components/widgets/slider/SliderWidget';
import {
    convertConfigsToConfig,
    type WidgetConfig,
} from '@/utils/widgetConfigUtils';
import React, { useCallback } from 'react';
import type { WidgetData } from '../../types';

interface SliderWidgetModalProps {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const SliderWidgetModal: React.FC<SliderWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    // Обертка для совместимости с SliderWidget, ожидающим Promise
    const handleConfigUpdateAsync = useCallback(
        async (updates: WidgetConfig) => {
            onConfigUpdate(updates);
        },
        [onConfigUpdate],
    );

    // Получаем конфигурацию из configs или config
    const sliderConfig = widget.configs
        ? convertConfigsToConfig(widget.configs)
        : pendingConfig || widget.config || {};

    return (
        <SliderWidget
            config={sliderConfig}
            isEditable
            autoExpandSettings
            onConfigChange={handleConfigUpdateAsync}
            configs={widget.configs}
            styling={widget.config?.styling as Record<string, any>}
            slider_slides={widget.slider_slides}
        />
    );
};
