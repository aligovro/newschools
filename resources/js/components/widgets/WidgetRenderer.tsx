import React from 'react';
import { HeroWidget } from './HeroWidget';

interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    slug: string;
    config: Record<string, unknown>;
    settings: Record<string, unknown>;
    is_active: boolean;
    is_visible: boolean;
    order: number;
    position_name: string;
    position_slug: string;
    created_at: string;
    updated_at?: string;
}

interface WidgetRendererProps {
    widget: WidgetData;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
    widget,
    isEditable = false,
    autoExpandSettings = false,
    onSave,
}) => {
    const renderWidget = () => {
        switch (widget.slug) {
            case 'hero':
            case 'hero-slider':
                return (
                    <HeroWidget
                        config={widget.config}
                        isEditable={isEditable}
                        autoExpandSettings={autoExpandSettings}
                        onSave={onSave}
                        widgetId={widget.id}
                    />
                );
            default:
                return (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                        <h3 className="mb-2 text-lg font-semibold">
                            {widget.name}
                        </h3>
                        <p className="text-gray-600">
                            Виджет "{widget.slug}" не найден
                        </p>
                    </div>
                );
        }
    };

    return <div className="widget-renderer">{renderWidget()}</div>;
};
