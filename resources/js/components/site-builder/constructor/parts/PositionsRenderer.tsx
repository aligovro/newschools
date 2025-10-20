import React from 'react';
import type { WidgetData, WidgetPosition } from '../../types';
import { PositionDropZone } from './PositionDropZone';

interface PositionsRendererProps {
    positions: WidgetPosition[];
    widgets: WidgetData[];
    isPreviewMode: boolean;
    newlyAddedWidgetId: string | null;
    validationErrors: string[];
    sidebarPosition: 'left' | 'right';
    onDropWidget: (item: { widget: any }, positionSlug: string) => void;
    onEditWidget: (widget: WidgetData) => void;
    onDeleteWidget: (widget: WidgetData) => void;
    onToggleWidgetVisibility: (widget: WidgetData) => void;
    onSaveWidgetConfig: (
        widgetId: string,
        config: Record<string, unknown>,
    ) => Promise<void>;
    onAddWidgetToPosition: (positionSlug: string) => void;
    onMoveSidebarLeft: () => void;
    onMoveSidebarRight: () => void;
}

export const PositionsRenderer: React.FC<PositionsRendererProps> = ({
    positions,
    widgets,
    isPreviewMode,
    newlyAddedWidgetId,
    validationErrors,
    sidebarPosition,
    onDropWidget,
    onEditWidget,
    onDeleteWidget,
    onToggleWidgetVisibility,
    onSaveWidgetConfig,
    onAddWidgetToPosition,
    onMoveSidebarLeft,
    onMoveSidebarRight,
}) => {
    const renderZone = (position: WidgetPosition) => (
        <PositionDropZone
            key={position.id}
            position={position}
            widgets={widgets}
            onDropWidget={onDropWidget}
            onEditWidget={onEditWidget}
            onDeleteWidget={onDeleteWidget}
            onToggleWidgetVisibility={onToggleWidgetVisibility}
            onSaveWidget={onSaveWidgetConfig}
            isPreviewMode={isPreviewMode}
            newlyAddedWidgetId={newlyAddedWidgetId}
            validationErrors={validationErrors}
            onAddWidgetToPosition={onAddWidgetToPosition}
            onMoveSidebarLeft={onMoveSidebarLeft}
            onMoveSidebarRight={onMoveSidebarRight}
            sidebarPosition={sidebarPosition}
        />
    );

    return (
        <div className="space-y-6 pb-20">
            {positions.filter((p) => p.area === 'header').map(renderZone)}

            {positions
                .filter((p) => p.slug === 'hero' || p.area === 'hero')
                .map(renderZone)}

            <div className="flex flex-col gap-6 lg:flex-row">
                {sidebarPosition === 'left' &&
                    positions.filter((p) => p.area === 'sidebar').length >
                        0 && (
                        <div className="w-full space-y-6 lg:w-96">
                            {positions
                                .filter((p) => p.area === 'sidebar')
                                .map(renderZone)}
                        </div>
                    )}

                <div className="flex-1 space-y-6">
                    {positions
                        .filter((p) => p.area === 'content')
                        .map(renderZone)}
                </div>

                {sidebarPosition === 'right' &&
                    positions.filter((p) => p.area === 'sidebar').length >
                        0 && (
                        <div className="w-full space-y-6 lg:w-96">
                            {positions
                                .filter((p) => p.area === 'sidebar')
                                .map(renderZone)}
                        </div>
                    )}
            </div>

            {positions.filter((p) => p.area === 'footer').map(renderZone)}
        </div>
    );
};
