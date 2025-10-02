import { Button } from '@/components/ui/button';
import { useWidgets } from '@/hooks/useWidgets';
import { PanelRight } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { WidgetPanel } from '../widget-system/WidgetPanel';
import { ContentBlocksPanel } from './ContentBlocksPanel';
import { DragDropProvider } from './DragDropProvider';
import { WidgetDisplay } from './WidgetDisplay';
import { WidgetEditModal } from './WidgetEditModal';
import { WidgetSelectModal } from './WidgetSelectModal';

interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    slug: string;
    config: WidgetConfig;
    settings: WidgetSettings;
    is_active: boolean;
    is_visible: boolean;
    order: number;
    position_name: string;
    position_slug: string;
    created_at: string;
    updated_at?: string;
}

interface WidgetPosition {
    id: number;
    name: string;
    slug: string;
    description: string;
    area: string;
    order: number;
    allowed_widgets: string[];
    is_required: boolean;
}

interface SiteBuilderProps {
    className?: string;
    template: Record<string, unknown>;
    siteId: number;
    initialLayoutConfig?:
        | { sidebar_position?: 'left' | 'right' }
        | Record<string, unknown>;
    initialWidgets?: WidgetData[];
    onWidgetsChange?: (widgets: WidgetData[]) => void;
    validationErrors?: string[];
}

// Компонент для drop-зоны в центральной области
const PositionDropZone: React.FC<{
    position: WidgetPosition;
    widgets: WidgetData[];
    onDropWidget: (
        widget: { widget: WidgetConfig },
        positionSlug: string,
    ) => void;
    onEditWidget: (widget: WidgetData) => void;
    onDeleteWidget: (widget: WidgetData) => void;
    onToggleWidgetVisibility: (widget: WidgetData) => void;
    onSaveWidget: (
        widgetId: string,
        config: Record<string, unknown>,
    ) => Promise<void>;
    isPreviewMode: boolean;
    newlyAddedWidgetId?: string | null;
    validationErrors: string[];
    onAddWidgetToPosition: (positionSlug: string) => void;
    onMoveSidebarLeft?: () => void;
    onMoveSidebarRight?: () => void;
    sidebarPosition?: 'left' | 'right';
}> = ({
    position,
    widgets,
    onDropWidget,
    onEditWidget,
    onDeleteWidget,
    onToggleWidgetVisibility,
    onSaveWidget,
    isPreviewMode,
    newlyAddedWidgetId,
    validationErrors,
    onAddWidgetToPosition,
    onMoveSidebarLeft,
    onMoveSidebarRight,
    sidebarPosition,
}) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: 'widget',
        drop: (item: { widget: WidgetConfig }) => {
            onDropWidget(item, position.slug);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const positionWidgets = widgets
        .filter((widget) => widget.position_slug === position.slug)
        .sort((a, b) => a.order - b.order);

    // Функция для получения ошибок валидации для конкретного виджета
    const getWidgetErrors = (widget: WidgetData) => {
        return validationErrors.filter(
            (error) =>
                error.includes(`Виджет ${widget.id}`) ||
                error.includes(`Виджет ${widget.id}:`),
        );
    };

    return (
        <div
            ref={drop as unknown as React.RefObject<HTMLDivElement>}
            className={`widget-position rounded-lg border-2 border-dashed p-4 transition-colors ${
                isOver && canDrop
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 bg-gray-50'
            }`}
        >
            {position.area === 'sidebar' ? (
                <div className="mb-2 grid grid-cols-2 gap-2">
                    {sidebarPosition === 'right' ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onMoveSidebarLeft && onMoveSidebarLeft()
                            }
                            title="Переместить сайдбар влево"
                            className="w-full"
                        >
                            Влево ←
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onMoveSidebarRight && onMoveSidebarRight()
                            }
                            title="Переместить сайдбар вправо"
                            className="w-full"
                        >
                            → Вправо
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddWidgetToPosition(position.slug)}
                        title="Добавить виджет в эту позицию"
                        className="w-full"
                    >
                        + Добавить виджет
                    </Button>
                </div>
            ) : (
                <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {position.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {positionWidgets.length} виджетов
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddWidgetToPosition(position.slug)}
                            title="Добавить виджет в эту позицию"
                        >
                            + Добавить виджет
                        </Button>
                    </div>
                </div>
            )}

            <div className="min-h-[100px] space-y-4">
                {positionWidgets.map((widget) => {
                    const widgetErrors = getWidgetErrors(widget);
                    const shouldExpand = newlyAddedWidgetId === widget.id;
                    return (
                        <div key={widget.id} className="space-y-2">
                            <WidgetDisplay
                                widget={widget}
                                onEdit={onEditWidget}
                                onDelete={onDeleteWidget}
                                onToggleVisibility={onToggleWidgetVisibility}
                                onSave={onSaveWidget}
                                isEditable={!isPreviewMode}
                                autoExpandSettings={shouldExpand}
                                className="mb-4"
                            />
                            {widgetErrors.length > 0 && (
                                <div className="rounded border border-red-200 bg-red-50 p-2">
                                    <div className="text-sm text-red-600">
                                        <ul className="list-inside list-disc space-y-1">
                                            {widgetErrors.map(
                                                (error, index) => (
                                                    <li key={index}>{error}</li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {positionWidgets.length === 0 && (
                    <div className="flex h-24 items-center justify-center text-gray-500">
                        <p>
                            {isOver && canDrop
                                ? 'Отпустите виджет здесь'
                                : 'Перетащите виджет сюда или добавьте из левой панели'}
                        </p>
                    </div>
                )}
            </div>

            {position.area === 'sidebar' && (
                <div className="mt-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {position.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                        {positionWidgets.length} виджетов
                    </span>
                </div>
            )}
        </div>
    );
};

export const SiteBuilder: React.FC<SiteBuilderProps> = ({
    className,
    template,
    siteId,
    initialLayoutConfig = {},
    initialWidgets = [],
    onWidgetsChange,
    validationErrors = [],
}) => {
    const { widgets, addWidget, updateWidget, deleteWidget } = useWidgets(
        siteId,
        initialWidgets,
    );

    const [positions, setPositions] = useState<WidgetPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [isPreviewMode] = useState(false);
    const [editingWidget, setEditingWidget] = useState<WidgetData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isWidgetSelectModalOpen, setIsWidgetSelectModalOpen] =
        useState(false);
    const [selectedPosition, setSelectedPosition] = useState<string | null>(
        null,
    );
    const [newlyAddedWidgetId, setNewlyAddedWidgetId] = useState<string | null>(
        null,
    );

    const initialSidebar = (() => {
        const cfg = initialLayoutConfig as {
            sidebar_position?: 'left' | 'right';
        };
        return cfg && cfg.sidebar_position === 'left' ? 'left' : 'right';
    })();
    const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>(
        initialSidebar,
    );

    const saveLayout = useCallback(
        async (updates: { sidebar_position?: 'left' | 'right' }) => {
            try {
                const res = await fetch(
                    `/api/sites/${siteId}/settings/layout`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') || '',
                        },
                        body: JSON.stringify(updates),
                    },
                );
                const data = await res.json();
                if (!data.success) {
                    console.error('Layout save error:', data.message);
                }
            } catch (error) {
                console.error('Error saving layout:', error);
            }
        },
        [siteId],
    );

    const moveSidebarLeft = useCallback(() => {
        setSidebarPosition('left');
        saveLayout({ sidebar_position: 'left' });
    }, [saveLayout]);

    const moveSidebarRight = useCallback(() => {
        setSidebarPosition('right');
        saveLayout({ sidebar_position: 'right' });
    }, [saveLayout]);

    // Уведомляем родительский компонент об изменении виджетов
    useEffect(() => {
        if (onWidgetsChange) {
            onWidgetsChange(widgets);
        }
    }, [widgets, onWidgetsChange]);

    // Сбрасываем флаг нового виджета через 3 секунды
    useEffect(() => {
        if (newlyAddedWidgetId) {
            const timer = setTimeout(() => {
                setNewlyAddedWidgetId(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [newlyAddedWidgetId]);

    // Удалены неиспользуемые функции handleSave, handlePreview, handleExport, handleImport

    // Загрузка позиций
    const loadPositions = useCallback(async () => {
        try {
            setLoading(true);
            const templateId = template?.id || 1;
            const positionsResponse = await fetch(
                `/api/widgets/positions?template_id=${templateId}`,
            );
            const positionsData = await positionsResponse.json();

            if (positionsData.success) {
                setPositions(positionsData.data || []);
            }
        } catch (error) {
            console.error('Error loading positions:', error);
        } finally {
            setLoading(false);
        }
    }, [template]);

    // Загрузка позиций
    useEffect(() => {
        loadPositions();
    }, [loadPositions]);

    const handleAddWidgetToPosition = useCallback(
        async (positionSlug: string) => {
            setSelectedPosition(positionSlug);
            setIsWidgetSelectModalOpen(true);
        },
        [],
    );

    const handleSelectWidget = useCallback(
        async (widget: WidgetConfig) => {
            if (!selectedPosition) return;

            try {
                const newWidget = await addWidget(
                    widget.slug,
                    selectedPosition,
                );
                setIsWidgetSelectModalOpen(false);
                setSelectedPosition(null);
                // После успешного добавления виджета, автоматически открываем его настройки
                if (newWidget) {
                    setNewlyAddedWidgetId(newWidget.id);
                    setEditingWidget(newWidget);
                    setIsEditModalOpen(true);
                }
            } catch (error) {
                console.error('Error adding widget:', error);
            }
        },
        [selectedPosition, addWidget],
    );

    const handleDropWidget = useCallback(
        async (item: { widget: WidgetConfig }, positionSlug: string) => {
            const widgetData = item.widget || item;

            try {
                const newWidget = await addWidget(
                    widgetData.slug,
                    positionSlug,
                );
                // После успешного добавления виджета, автоматически открываем его настройки
                if (newWidget) {
                    setNewlyAddedWidgetId(newWidget.id);
                    setEditingWidget(newWidget);
                    setIsEditModalOpen(true);
                }
            } catch (error) {
                console.error('Error adding widget:', error);
            }
        },
        [addWidget],
    );

    const handleEditWidget = (widget: WidgetData) => {
        // Логика редактирования виджета
        setEditingWidget(widget);
        setIsEditModalOpen(true);
    };

    const handleDeleteWidget = useCallback(
        async (widget: WidgetData) => {
            try {
                await deleteWidget(widget.id);
            } catch (error) {
                console.error('Error deleting widget:', error);
            }
        },
        [deleteWidget],
    );

    const handleToggleWidgetVisibility = useCallback(
        async (widget: WidgetData) => {
            try {
                await updateWidget(widget.id, {
                    is_visible: !widget.is_visible,
                });
            } catch (error) {
                console.error('Error toggling widget visibility:', error);
            }
        },
        [updateWidget],
    );

    const handleSaveWidget = useCallback(
        async (updatedWidget: WidgetData) => {
            try {
                await updateWidget(updatedWidget.id, updatedWidget);
            } catch (error) {
                console.error('Error saving widget:', error);
            }
        },
        [updateWidget],
    );

    const handleSaveWidgetConfig = useCallback(
        async (widgetId: string, config: Record<string, unknown>) => {
            try {
                await updateWidget(widgetId, { config });
                console.log('Widget config saved:', widgetId, config);
            } catch (error) {
                console.error('Error saving widget config:', error);
                throw error;
            }
        },
        [updateWidget],
    );

    return (
        <DragDropProvider>
            <div className={`flex h-full flex-col bg-gray-100 ${className}`}>
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
                                onClick={() =>
                                    setIsRightPanelOpen(!isRightPanelOpen)
                                }
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
                    {/* Left Sidebar - Widgets Panel */}
                    {isRightPanelOpen && (
                        <div className="h-full w-80 flex-shrink-0 border-r border-gray-200 bg-white">
                            {template ? (
                                <WidgetPanel
                                    template={template}
                                    className="h-full"
                                />
                            ) : (
                                <ContentBlocksPanel className="h-full" />
                            )}
                        </div>
                    )}

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
                                <div className="space-y-6 pb-20">
                                    {positions
                                        .filter((p) => p.area === 'header')
                                        .map((position) => (
                                            <PositionDropZone
                                                key={position.id}
                                                position={position}
                                                widgets={widgets}
                                                onDropWidget={handleDropWidget}
                                                onEditWidget={handleEditWidget}
                                                onDeleteWidget={
                                                    handleDeleteWidget
                                                }
                                                onToggleWidgetVisibility={
                                                    handleToggleWidgetVisibility
                                                }
                                                onSaveWidget={
                                                    handleSaveWidgetConfig
                                                }
                                                isPreviewMode={isPreviewMode}
                                                newlyAddedWidgetId={
                                                    newlyAddedWidgetId
                                                }
                                                validationErrors={
                                                    validationErrors
                                                }
                                                onAddWidgetToPosition={
                                                    handleAddWidgetToPosition
                                                }
                                            />
                                        ))}

                                    {/* Hero section (explicit) */}
                                    {positions
                                        .filter(
                                            (p) =>
                                                p.slug === 'hero' ||
                                                p.area === 'hero',
                                        )
                                        .map((position) => (
                                            <PositionDropZone
                                                key={position.id}
                                                position={position}
                                                widgets={widgets}
                                                onDropWidget={handleDropWidget}
                                                onEditWidget={handleEditWidget}
                                                onDeleteWidget={
                                                    handleDeleteWidget
                                                }
                                                onToggleWidgetVisibility={
                                                    handleToggleWidgetVisibility
                                                }
                                                onSaveWidget={
                                                    handleSaveWidgetConfig
                                                }
                                                isPreviewMode={isPreviewMode}
                                                newlyAddedWidgetId={
                                                    newlyAddedWidgetId
                                                }
                                                validationErrors={
                                                    validationErrors
                                                }
                                                onAddWidgetToPosition={
                                                    handleAddWidgetToPosition
                                                }
                                            />
                                        ))}

                                    <div className="flex flex-col gap-6 lg:flex-row">
                                        {sidebarPosition === 'left' &&
                                            positions.some(
                                                (p) => p.area === 'sidebar',
                                            ) && (
                                                <div className="w-full space-y-6 lg:w-96">
                                                    {positions
                                                        .filter(
                                                            (p) =>
                                                                p.area ===
                                                                'sidebar',
                                                        )
                                                        .map((position) => (
                                                            <PositionDropZone
                                                                key={
                                                                    position.id
                                                                }
                                                                position={
                                                                    position
                                                                }
                                                                widgets={
                                                                    widgets
                                                                }
                                                                onDropWidget={
                                                                    handleDropWidget
                                                                }
                                                                onEditWidget={
                                                                    handleEditWidget
                                                                }
                                                                onDeleteWidget={
                                                                    handleDeleteWidget
                                                                }
                                                                onToggleWidgetVisibility={
                                                                    handleToggleWidgetVisibility
                                                                }
                                                                onSaveWidget={
                                                                    handleSaveWidgetConfig
                                                                }
                                                                isPreviewMode={
                                                                    isPreviewMode
                                                                }
                                                                newlyAddedWidgetId={
                                                                    newlyAddedWidgetId
                                                                }
                                                                validationErrors={
                                                                    validationErrors
                                                                }
                                                                onAddWidgetToPosition={
                                                                    handleAddWidgetToPosition
                                                                }
                                                                onMoveSidebarLeft={
                                                                    moveSidebarLeft
                                                                }
                                                                onMoveSidebarRight={
                                                                    moveSidebarRight
                                                                }
                                                                sidebarPosition={
                                                                    sidebarPosition
                                                                }
                                                            />
                                                        ))}
                                                </div>
                                            )}

                                        <div className="flex-1 space-y-6">
                                            {positions
                                                .filter(
                                                    (p) => p.area === 'content',
                                                )
                                                .map((position) => (
                                                    <PositionDropZone
                                                        key={position.id}
                                                        position={position}
                                                        widgets={widgets}
                                                        onDropWidget={
                                                            handleDropWidget
                                                        }
                                                        onEditWidget={
                                                            handleEditWidget
                                                        }
                                                        onDeleteWidget={
                                                            handleDeleteWidget
                                                        }
                                                        onToggleWidgetVisibility={
                                                            handleToggleWidgetVisibility
                                                        }
                                                        onSaveWidget={
                                                            handleSaveWidgetConfig
                                                        }
                                                        isPreviewMode={
                                                            isPreviewMode
                                                        }
                                                        newlyAddedWidgetId={
                                                            newlyAddedWidgetId
                                                        }
                                                        validationErrors={
                                                            validationErrors
                                                        }
                                                        onAddWidgetToPosition={
                                                            handleAddWidgetToPosition
                                                        }
                                                    />
                                                ))}
                                        </div>

                                        {sidebarPosition === 'right' &&
                                            positions.some(
                                                (p) => p.area === 'sidebar',
                                            ) && (
                                                <div className="w-full space-y-6 lg:w-96">
                                                    {positions
                                                        .filter(
                                                            (p) =>
                                                                p.area ===
                                                                'sidebar',
                                                        )
                                                        .map((position) => (
                                                            <PositionDropZone
                                                                key={
                                                                    position.id
                                                                }
                                                                position={
                                                                    position
                                                                }
                                                                widgets={
                                                                    widgets
                                                                }
                                                                onDropWidget={
                                                                    handleDropWidget
                                                                }
                                                                onEditWidget={
                                                                    handleEditWidget
                                                                }
                                                                onDeleteWidget={
                                                                    handleDeleteWidget
                                                                }
                                                                onToggleWidgetVisibility={
                                                                    handleToggleWidgetVisibility
                                                                }
                                                                onSaveWidget={
                                                                    handleSaveWidgetConfig
                                                                }
                                                                isPreviewMode={
                                                                    isPreviewMode
                                                                }
                                                                newlyAddedWidgetId={
                                                                    newlyAddedWidgetId
                                                                }
                                                                validationErrors={
                                                                    validationErrors
                                                                }
                                                                onAddWidgetToPosition={
                                                                    handleAddWidgetToPosition
                                                                }
                                                                onMoveSidebarRight={
                                                                    moveSidebarRight
                                                                }
                                                                onMoveSidebarLeft={
                                                                    moveSidebarLeft
                                                                }
                                                                sidebarPosition={
                                                                    sidebarPosition
                                                                }
                                                            />
                                                        ))}
                                                </div>
                                            )}
                                    </div>

                                    {positions
                                        .filter((p) => p.area === 'footer')
                                        .map((position) => (
                                            <PositionDropZone
                                                key={position.id}
                                                position={position}
                                                widgets={widgets}
                                                onDropWidget={handleDropWidget}
                                                onEditWidget={handleEditWidget}
                                                onDeleteWidget={
                                                    handleDeleteWidget
                                                }
                                                onToggleWidgetVisibility={
                                                    handleToggleWidgetVisibility
                                                }
                                                onSaveWidget={
                                                    handleSaveWidgetConfig
                                                }
                                                isPreviewMode={isPreviewMode}
                                                newlyAddedWidgetId={
                                                    newlyAddedWidgetId
                                                }
                                                validationErrors={
                                                    validationErrors
                                                }
                                                onAddWidgetToPosition={
                                                    handleAddWidgetToPosition
                                                }
                                            />
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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
                onSaveConfig={async (id, cfg) =>
                    handleSaveWidgetConfig(id, cfg)
                }
                siteId={siteId}
                positions={positions.map((p) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                }))}
                onMove={async (widgetId, positionSlug) => {
                    // Найдём текущий виджет для вычисления нового order
                    const widgetsInTarget = widgets
                        .filter((w) => w.position_slug === positionSlug)
                        .sort((a, b) => a.order - b.order);
                    const newOrder = widgetsInTarget.length + 1;
                    await fetch(
                        `/dashboard/sites/${siteId}/widgets/${widgetId}/move`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN':
                                    document
                                        .querySelector(
                                            'meta[name="csrf-token"]',
                                        )
                                        ?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                position_slug: positionSlug,
                                order: newOrder,
                            }),
                        },
                    );
                    // Обновим локально
                    const idx = widgets.findIndex((w) => w.id === widgetId);
                    if (idx !== -1) {
                        const copy: WidgetData[] = [...widgets];
                        copy[idx] = {
                            ...copy[idx],
                            position_slug: positionSlug,
                            order: newOrder,
                        } as WidgetData;
                        onWidgetsChange?.(copy);
                    }
                }}
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
        </DragDropProvider>
    );
};
