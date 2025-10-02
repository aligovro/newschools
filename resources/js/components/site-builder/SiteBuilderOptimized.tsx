import { Button } from '@/components/ui/button';
import { useWidgets } from '@/hooks';
import { LayoutConfig, WidgetData } from '@/types/global';
import { PanelRight } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { WidgetPanel } from '../widget-system/WidgetPanel';
import { ContentBlocksPanel } from './ContentBlocksPanel';
import { DragDropProvider } from './DragDropProvider';
import { PositionDropZone } from './PositionDropZone';
import { PositionsPanel } from './PositionsPanel';
import { WidgetEditModal } from './WidgetEditModal';
import { WidgetSelectModal } from './WidgetSelectModal';

interface SiteBuilderProps {
    className?: string;
    template?: LayoutConfig;
    onAddWidget: (widget: any, position: string) => void;
    initialContent?: Record<string, unknown>;
    onSave?: (content: Record<string, unknown>) => void;
    onPreview?: () => void;
}

export const SiteBuilderOptimized: React.FC<SiteBuilderProps> = React.memo(
    ({
        className,
        template,
        onAddWidget,
        initialContent,
        onSave,
        onPreview,
    }) => {
        const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
        const [editingWidget, setEditingWidget] = useState<WidgetData | null>(
            null,
        );
        const [isEditModalOpen, setIsEditModalOpen] = useState(false);
        const [isWidgetSelectModalOpen, setIsWidgetSelectModalOpen] =
            useState(false);
        const [selectedPosition, setSelectedPosition] = useState<string | null>(
            null,
        );

        // Используем кастомный хук для управления виджетами
        const {
            widgets,
            positions,
            loading,
            error,
            addWidget,
            updateWidget,
            deleteWidget,
            toggleWidgetVisibility,
            updateWidgetConfig,
        } = useWidgets({ templateId: template?.id });

        // Мемоизированные обработчики
        const handleToggleRightPanel = useCallback(() => {
            setIsRightPanelOpen((prev) => !prev);
        }, []);

        const handleAddWidgetToPosition = useCallback(
            (positionName: string) => {
                setSelectedPosition(positionName);
                setIsWidgetSelectModalOpen(true);
            },
            [],
        );

        const handleSelectWidget = useCallback(
            (widget: any) => {
                if (selectedPosition) {
                    const newWidget: WidgetData = {
                        id: Date.now(),
                        name: widget.name,
                        slug: widget.slug,
                        config: {},
                        settings: {},
                        is_active: true,
                        is_visible: true,
                        order: widgets.length + 1,
                        position_name: selectedPosition,
                        component_name: widget.component_name,
                    };

                    addWidget(newWidget);

                    // Открываем модальное окно редактирования только для не-Hero виджетов
                    if (widget.slug !== 'hero') {
                        setEditingWidget(newWidget);
                        setIsEditModalOpen(true);
                    }
                }

                setIsWidgetSelectModalOpen(false);
                setSelectedPosition(null);
            },
            [selectedPosition, widgets.length, addWidget],
        );

        const handleDropWidget = useCallback(
            (item: { widget: WidgetData }, position: string) => {
                const widgetData = item.widget || item;
                const newWidget: WidgetData = {
                    id: Date.now(),
                    name: widgetData.name,
                    slug: widgetData.slug,
                    config: {},
                    settings: {},
                    is_active: true,
                    is_visible: true,
                    order: widgets.length + 1,
                    position_name: position,
                    component_name: widgetData.component_name,
                };

                addWidget(newWidget);

                // Открываем модальное окно редактирования только для не-Hero виджетов
                if (widgetData.slug !== 'hero') {
                    setEditingWidget(newWidget);
                    setIsEditModalOpen(true);
                }
            },
            [widgets.length, addWidget],
        );

        const handleEditWidget = useCallback((widget: WidgetData) => {
            setEditingWidget(widget);
            setIsEditModalOpen(true);
        }, []);

        const handleDeleteWidget = useCallback(
            (widgetId: number) => {
                deleteWidget(widgetId);
            },
            [deleteWidget],
        );

        const handleToggleWidgetVisibility = useCallback(
            (widgetId: number) => {
                toggleWidgetVisibility(widgetId);
            },
            [toggleWidgetVisibility],
        );

        const handleWidgetConfigChange = useCallback(
            (widgetId: number, config: Record<string, unknown>) => {
                updateWidgetConfig(widgetId, config);
            },
            [updateWidgetConfig],
        );

        const handleSaveWidget = useCallback(
            (widgetId: number, updates: Partial<WidgetData>) => {
                updateWidget(widgetId, updates);
                setIsEditModalOpen(false);
                setEditingWidget(null);
            },
            [updateWidget],
        );

        // Мемоизированные группы виджетов по позициям
        const widgetsByPosition = useMemo(() => {
            return positions.reduce(
                (acc, position) => {
                    acc[position.slug] = widgets.filter(
                        (w) => w.position_name === position.slug,
                    );
                    return acc;
                },
                {} as Record<string, WidgetData[]>,
            );
        }, [positions, widgets]);

        if (error) {
            return (
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600">Ошибка загрузки: {error}</p>
                    </div>
                </div>
            );
        }

        return (
            <DragDropProvider>
                <div
                    className={`flex h-full flex-col bg-gray-100 ${className}`}
                >
                    {/* Header */}
                    <div className="border-b border-gray-200 bg-white px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Конструктор сайта
                                </h2>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleToggleRightPanel}
                                    title={
                                        isRightPanelOpen
                                            ? 'Скрыть панель виджетов'
                                            : 'Показать панель виджетов'
                                    }
                                >
                                    <PanelRight
                                        className={`h-4 w-4 ${!isRightPanelOpen ? 'rotate-180' : ''}`}
                                    />
                                    <span className="ml-2 hidden sm:inline">
                                        {isRightPanelOpen
                                            ? 'Скрыть виджеты'
                                            : 'Показать виджеты'}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Sidebar - Positions Panel */}
                        <div className="h-full flex-shrink-0">
                            <PositionsPanel
                                positions={positions}
                                onAddWidgetToPosition={
                                    handleAddWidgetToPosition
                                }
                            />
                        </div>

                        {/* Main Builder Area */}
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
                                    <div className="space-y-6">
                                        {positions.map((position) => (
                                            <PositionDropZone
                                                key={position.id}
                                                position={position}
                                                widgets={
                                                    widgetsByPosition[
                                                        position.slug
                                                    ] || []
                                                }
                                                onDropWidget={handleDropWidget}
                                                onEditWidget={handleEditWidget}
                                                onDeleteWidget={
                                                    handleDeleteWidget
                                                }
                                                onToggleWidgetVisibility={
                                                    handleToggleWidgetVisibility
                                                }
                                                onWidgetConfigChange={
                                                    handleWidgetConfigChange
                                                }
                                                isPreviewMode={false}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
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

                    {/* Widget Edit Modal */}
                    <WidgetEditModal
                        widget={editingWidget}
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setEditingWidget(null);
                        }}
                        onSave={handleSaveWidget}
                    />

                    {/* Widget Select Modal */}
                    <WidgetSelectModal
                        isOpen={isWidgetSelectModalOpen}
                        onClose={() => {
                            setIsWidgetSelectModalOpen(false);
                            setSelectedPosition(null);
                        }}
                        onSelectWidget={handleSelectWidget}
                        widgets={widgets}
                        positionName={selectedPosition || ''}
                    />
                </div>
            </DragDropProvider>
        );
    },
);

SiteBuilderOptimized.displayName = 'SiteBuilderOptimized';
