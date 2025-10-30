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
    onMoveWidgetOrder: (
        widgetId: string,
        positionSlug: string,
        order: number,
    ) => Promise<void>;
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
    onMoveWidgetOrder,
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
            onMoveWidgetOrder={onMoveWidgetOrder}
        />
    );

    return (
        <div className="space-y-6 pb-20">
            {/* Header grouped: four columns (header-col-1..4) and a full-width 'header' below */}
            {(() => {
                const headerColSlugs = [
                    'header-col-1',
                    'header-col-2',
                    'header-col-3',
                    'header-col-4',
                ];
                const headerCols = positions.filter(
                    (p) =>
                        p.area === 'header' && headerColSlugs.includes(p.slug),
                );
                const headerFull = positions.find(
                    (p) => p.area === 'header' && p.slug === 'header',
                );

                if (headerCols.length === 0 && !headerFull) {
                    return positions
                        .filter((p) => p.area === 'header')
                        .map(renderZone);
                }

                return (
                    <div className="space-y-6">
                        {headerCols.length > 0 && (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {headerCols.map(renderZone)}
                            </div>
                        )}
                        {headerFull && <div>{renderZone(headerFull)}</div>}
                    </div>
                );
            })()}

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

            {/* Footer grouped: four equal columns */}
            {(() => {
                const footerColSlugs = [
                    'footer-col-1',
                    'footer-col-2',
                    'footer-col-3',
                    'footer-col-4',
                ];
                const footerCols = positions.filter(
                    (p) =>
                        p.area === 'footer' && footerColSlugs.includes(p.slug),
                );
                const otherFooter = positions.filter(
                    (p) =>
                        p.area === 'footer' && !footerColSlugs.includes(p.slug),
                );

                return (
                    <div className="space-y-6">
                        {footerCols.length > 0 && (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {footerCols.map(renderZone)}
                            </div>
                        )}
                        {otherFooter.map(renderZone)}
                    </div>
                );
            })()}
        </div>
    );
};
