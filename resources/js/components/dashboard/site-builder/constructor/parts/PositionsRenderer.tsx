import React from 'react';
import type { WidgetData, WidgetPosition } from '../../types';
import { PositionDropZone } from './PositionDropZone';

interface PositionsRendererProps {
    positions: WidgetPosition[];
    widgets: WidgetData[];
    positionSettings?: Record<string, Record<string, any>>;
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
    onEditPosition: (position: WidgetPosition) => void;
}

export const PositionsRenderer: React.FC<PositionsRendererProps> = ({
    positions,
    widgets,
    positionSettings = {},
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
    onEditPosition,
}) => {
    const renderZone = (position: WidgetPosition) => (
        <PositionDropZone
            key={position.id}
            position={position}
            widgets={widgets}
            positionSettings={positionSettings[position.slug]}
            onDropWidget={onDropWidget}
            onEditWidget={onEditWidget}
            onDeleteWidget={onDeleteWidget}
            onToggleWidgetVisibility={onToggleWidgetVisibility}
            onSaveWidget={onSaveWidgetConfig}
            isPreviewMode={false}
            newlyAddedWidgetId={newlyAddedWidgetId}
            validationErrors={validationErrors}
            onAddWidgetToPosition={onAddWidgetToPosition}
            onMoveSidebarLeft={onMoveSidebarLeft}
            onMoveSidebarRight={onMoveSidebarRight}
            sidebarPosition={sidebarPosition}
            onMoveWidgetOrder={onMoveWidgetOrder}
            onEditPosition={() => onEditPosition(position)}
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

                // В конструкторе всегда показываем все позиции
                const headerColsToShow = headerCols;

                // Если есть хотя бы одна позиция хедера, показываем группу
                const hasHeaderPositions =
                    headerColsToShow.length > 0 || headerFull;

                if (!hasHeaderPositions) return null;

                return (
                    <div className="space-y-4 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                        <h2 className="text-center text-lg font-semibold text-gray-700">
                            Хэдер
                        </h2>
                        <div className="space-y-4">
                            {headerColsToShow.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {headerColsToShow.map((position) =>
                                        renderZone(position),
                                    )}
                                </div>
                            )}
                            {headerFull && <div>{renderZone(headerFull)}</div>}
                        </div>
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

            {/* Content bottom (full-width zone before footer columns) */}
            {positions
                .filter((p) => p.slug === 'content-bottom')
                .map(renderZone)}

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
                // Все прочие позиции футера, кроме content-bottom (она уже отрендерена выше)
                const otherFooter = positions.filter(
                    (p) =>
                        p.area === 'footer' &&
                        !footerColSlugs.includes(p.slug) &&
                        p.slug !== 'content-bottom',
                );

                // Если есть хотя бы одна позиция футера, показываем группу
                const hasFooterPositions =
                    footerCols.length > 0 || otherFooter.length > 0;

                if (!hasFooterPositions) return null;

                return (
                    <div className="space-y-4 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                        <h2 className="text-center text-lg font-semibold text-gray-700">
                            Футер
                        </h2>
                        <div className="space-y-4">
                            {footerCols.length > 0 && (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {footerCols.map(renderZone)}
                                </div>
                            )}
                            {otherFooter.map(renderZone)}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
