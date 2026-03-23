import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WidgetData } from '@/components/dashboard/site-builder/types';
import { convertConfigsToConfig, type WidgetConfig } from '@/utils/widgetConfigUtils';
import React, { useEffect, useState } from 'react';

interface OrgRequisitesDownloadWidgetModalProps {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (config: WidgetConfig) => void;
}

export const OrgRequisitesDownloadWidgetModal: React.FC<
    OrgRequisitesDownloadWidgetModalProps
> = ({ widget, pendingConfig, onConfigUpdate }) => {
    const initialConfig = widget.configs
        ? convertConfigsToConfig(widget.configs)
        : (widget.config as WidgetConfig) || {};

    const resolved = (pendingConfig ?? initialConfig) as Record<string, unknown>;

    const [buttonLabel, setButtonLabel] = useState(
        (resolved.button_label as string) ?? 'Скачать реквизиты школы',
    );

    // Синхронизируем при смене виджета
    useEffect(() => {
        const cfg = (pendingConfig ?? initialConfig) as Record<string, unknown>;
        setButtonLabel((cfg.button_label as string) ?? 'Скачать реквизиты школы');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [widget.id]);

    useEffect(() => {
        onConfigUpdate({ button_label: buttonLabel });
    }, [buttonLabel, onConfigUpdate]);

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="org-req-button-label">Текст кнопки</Label>
                <Input
                    id="org-req-button-label"
                    value={buttonLabel}
                    onChange={(e) => setButtonLabel(e.target.value)}
                    placeholder="Скачать реквизиты школы"
                    className="mt-1"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                    Кнопка отображается только если реквизиты организации
                    заполнены в настройках платежей.
                </p>
            </div>
        </div>
    );
};
