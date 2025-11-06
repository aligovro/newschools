import { DonationWidget } from '@/components/dashboard/widgets/DonationWidget';
import React from 'react';
import { DonationOutputConfig, WidgetOutputProps } from './types';

export const DonationOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as DonationOutputConfig;

    const mapped = {
        title: config.title,
        show_title: config.show_title ?? true, // По умолчанию true для обратной совместимости
        description: config.description,
        preset_amounts: config.suggestedAmounts,
        min_amount: config.minAmount,
        max_amount: config.maxAmount,
        currency: (config.currency as 'RUB' | 'USD' | 'EUR') || 'RUB',
        show_progress: config.showProgress,
        // Для публичного получения методов оплаты используем organizationId
        // IDs проектов/фандрайзеров можно добавить в config при необходимости
    } as Record<string, unknown>;

    return (
        <div className={`donation-output ${className || ''}`} style={style}>
            <DonationWidget
                config={mapped}
                isEditable={false}
                organizationId={config.organizationId}
            />
        </div>
    );
};
