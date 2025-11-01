import React from 'react';
import { WidgetPanel } from '../../widget-system/WidgetPanel';
import type { WidgetData } from '../types';
import {
    HeaderControls,
    ModalsWrapper,
    PositionsRenderer,
    useSiteBuilderState,
} from './';
import { DragDropProvider } from './DragDropProvider';
import { PositionSettingsModal } from './modals/PositionSettingsModal';

interface SiteBuilderProps {
    className?: string;
    template: Record<string, unknown>;
    siteId: number;
    initialLayoutConfig?:
        | { sidebar_position?: 'left' | 'right' }
        | Record<string, unknown>;
    initialWidgets?: WidgetData[];
    onWidgetsChange?: (widgets: WidgetData[], isLoading: boolean) => void;
    validationErrors?: string[];
}

export const SiteBuilder: React.FC<SiteBuilderProps> = ({
    className,
    template,
    siteId,
    initialLayoutConfig = {},
    initialWidgets = [],
    onWidgetsChange,
    validationErrors = [],
}) => {
    const {
        widgets,
        positions,
        loading,
        isRightPanelOpen,
        setIsRightPanelOpen,
        isPreviewMode,
        editingWidget,
        isEditModalOpen,
        isWidgetSelectModalOpen,
        selectedPosition,
        newlyAddedWidgetId,
        sidebarPosition,
        availableWidgets,
        loadingAvailableWidgets,
        handleAddWidgetToPosition,
        handleSelectWidget,
        handleDropWidget,
        handleEditWidget,
        handleDeleteWidget,
        handleToggleWidgetVisibility,
        handleSaveWidget,
        handleSaveWidgetConfig,
        moveSidebarLeft,
        moveSidebarRight,
        setIsEditModalOpen,
        setEditingWidget,
        setIsWidgetSelectModalOpen,
        setSelectedPosition,
        onMoveWidget,
        onMoveWidgetOrder,
    } = useSiteBuilderState({
        template,
        siteId,
        initialLayoutConfig,
        initialWidgets,
        onWidgetsChange,
    });

    const [positionForSettings, setPositionForSettings] = React.useState<{
        id: number;
        name: string;
        slug: string;
        area: string;
        layout_config?: Record<string, unknown>;
    } | null>(null);
    const [positionSettingsOpen, setPositionSettingsOpen] = React.useState(false);

    return (
        <DragDropProvider>
            <div className={`flex h-full flex-col bg-gray-100 ${className}`}>
                <div className="border-b border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Конструктор сайта
                            </h2>
                        </div>

                        <div className="flex items-center space-x-2">
                            <HeaderControls
                                isRightPanelOpen={isRightPanelOpen}
                                onToggleRightPanel={() =>
                                    setIsRightPanelOpen(!isRightPanelOpen)
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {isRightPanelOpen && (
                        <div className="h-full w-80 flex-shrink-0 border-r border-gray-200 bg-white">
                            <WidgetPanel
                                template={template}
                                className="h-full"
                            />
                        </div>
                    )}

                    <div className="flex flex-1 flex-col overflow-hidden">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                    <p className="text-gray-600">
                                        Загрузка виджетов...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto p-6">
                                <PositionsRenderer
                                    positions={positions}
                                    widgets={widgets}
                                    isPreviewMode={isPreviewMode}
                                    newlyAddedWidgetId={newlyAddedWidgetId}
                                    validationErrors={validationErrors}
                                    sidebarPosition={sidebarPosition}
                                    onDropWidget={handleDropWidget}
                                    onEditWidget={handleEditWidget}
                                    onDeleteWidget={handleDeleteWidget}
                                    onToggleWidgetVisibility={
                                        handleToggleWidgetVisibility
                                    }
                                    onSaveWidgetConfig={handleSaveWidgetConfig}
                                    onAddWidgetToPosition={
                                        handleAddWidgetToPosition
                                    }
                                    onMoveSidebarLeft={moveSidebarLeft}
                                    onMoveSidebarRight={moveSidebarRight}
                                    onMoveWidgetOrder={onMoveWidgetOrder}
                                    onEditPosition={(p) => {
                                        setPositionForSettings(p);
                                        setPositionSettingsOpen(true);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ModalsWrapper
                editingWidget={editingWidget}
                isEditModalOpen={isEditModalOpen}
                onCloseEdit={() => {
                    setIsEditModalOpen(false);
                    setEditingWidget(null);
                }}
                onSaveWidget={handleSaveWidget}
                onSaveConfig={async (id, cfg) =>
                    handleSaveWidgetConfig(id, cfg)
                }
                siteId={siteId}
                positions={positions}
                isWidgetSelectModalOpen={isWidgetSelectModalOpen}
                onCloseSelect={() => {
                    setIsWidgetSelectModalOpen(false);
                    setSelectedPosition(null);
                }}
                onSelectWidget={handleSelectWidget}
                selectedPositionName={selectedPosition || ''}
                widgets={availableWidgets}
                loadingWidgets={loadingAvailableWidgets}
                onMoveWidget={onMoveWidget}
            />
            {positionForSettings && (
                <PositionSettingsModal
                    open={positionSettingsOpen}
                    onClose={() => setPositionSettingsOpen(false)}
                    siteId={siteId}
                    position={positionForSettings}
                />
            )}
        </DragDropProvider>
    );
};
