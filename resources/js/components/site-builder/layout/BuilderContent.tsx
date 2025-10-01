import { LayoutConfig, WidgetData, WidgetPosition } from '@/types/global';
import React from 'react';
import { WidgetPanel } from '../../widget-system/WidgetPanel';
import { ContentBlocksPanel } from '../ContentBlocksPanel';
import { PositionDropZone } from '../PositionDropZone';
import { PositionsPanel } from '../PositionsPanel';

interface BuilderContentProps {
    loading: boolean;
    positions: WidgetPosition[];
    widgets: WidgetData[];
    template?: LayoutConfig;
    isRightPanelOpen: boolean;
    isPreviewMode: boolean;
    onAddWidgetToPosition: (positionName: string) => void;
    onDropWidget: (item: { widget: WidgetData }, position: string) => void;
    onEditWidget: (widget: WidgetData) => void;
    onDeleteWidget: (widgetId: number) => void;
    onToggleWidgetVisibility: (widgetId: number) => void;
    onWidgetConfigChange: (
        widgetId: number,
        config: Record<string, unknown>,
    ) => void;
    onAddWidget: (widget: any, position: string) => void;
}

export const BuilderContent: React.FC<BuilderContentProps> = React.memo(
    ({
        loading,
        positions,
        widgets,
        template,
        isRightPanelOpen,
        isPreviewMode,
        onAddWidgetToPosition,
        onDropWidget,
        onEditWidget,
        onDeleteWidget,
        onToggleWidgetVisibility,
        onWidgetConfigChange,
        onAddWidget,
    }) => {
        if (loading) {
            return (
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <p className="text-gray-600">Загрузка виджетов...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Positions Panel */}
                <div className="h-full flex-shrink-0">
                    <PositionsPanel
                        positions={positions}
                        onAddWidgetToPosition={onAddWidgetToPosition}
                    />
                </div>

                {/* Main Builder Area */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="h-full overflow-y-auto p-6">
                        <div className="space-y-6">
                            {positions.map((position) => (
                                <PositionDropZone
                                    key={position.id}
                                    position={position}
                                    widgets={widgets}
                                    onDropWidget={onDropWidget}
                                    onEditWidget={onEditWidget}
                                    onDeleteWidget={onDeleteWidget}
                                    onToggleWidgetVisibility={
                                        onToggleWidgetVisibility
                                    }
                                    onWidgetConfigChange={onWidgetConfigChange}
                                    isPreviewMode={isPreviewMode}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Widgets Panel */}
                {isRightPanelOpen && (
                    <div className="h-full w-80 flex-shrink-0 border-l border-gray-200 bg-white">
                        {template ? (
                            <WidgetPanel
                                template={template}
                                onAddWidget={onAddWidget}
                                className="h-full"
                            />
                        ) : (
                            <ContentBlocksPanel className="h-full" />
                        )}
                    </div>
                )}
            </div>
        );
    },
);

BuilderContent.displayName = 'BuilderContent';
