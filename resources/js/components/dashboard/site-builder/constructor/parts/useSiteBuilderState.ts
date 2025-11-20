import { useWidgets } from '@/hooks/useWidgets';
import { sitesApi, widgetsSystemApi } from '@/lib/api/index';
import type { Widget } from '@/lib/api/widgets-system';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WidgetData, WidgetPosition } from '../../types';

interface UseStateArgs {
    template: Record<string, unknown>;
    siteId: number;
    initialLayoutConfig?:
        | { sidebar_position?: 'left' | 'right' }
        | Record<string, unknown>;
    initialWidgets?: WidgetData[];
    onWidgetsChange?: (widgets: WidgetData[], isLoading: boolean) => void;
}

export const useSiteBuilderState = ({
    template,
    siteId,
    initialLayoutConfig = {},
    initialWidgets = [],
    onWidgetsChange,
}: UseStateArgs) => {
    const {
        widgets,
        addWidget,
        updateWidget,
        deleteWidget,
        moveWidget,
        isLoading,
        refreshWidgets,
    } = useWidgets(siteId, initialWidgets);

    const [positions, setPositions] = useState<WidgetPosition[]>([]);
    const [positionSettings, setPositionSettings] = useState<
        Record<string, Record<string, unknown>>
    >({});
    const [loading, setLoading] = useState(true);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
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
    const [availableWidgets, setAvailableWidgets] = useState<Widget[]>([]);
    const [loadingAvailableWidgets, setLoadingAvailableWidgets] =
        useState(false);

    const initialSidebar = useMemo(() => {
        const cfg = initialLayoutConfig as {
            sidebar_position?: 'left' | 'right';
        };
        return cfg && cfg.sidebar_position === 'left' ? 'left' : 'right';
    }, [initialLayoutConfig]);
    const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>(
        initialSidebar,
    );

    const saveLayout = useCallback(
        async (updates: { sidebar_position?: 'left' | 'right' }) => {
            try {
                await sitesApi.saveLayoutSettings(siteId, updates);
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

    useEffect(() => {
        if (onWidgetsChange) onWidgetsChange(widgets, isLoading);
    }, [widgets, isLoading, onWidgetsChange]);

    useEffect(() => {
        if (newlyAddedWidgetId) {
            const timer = setTimeout(() => setNewlyAddedWidgetId(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [newlyAddedWidgetId]);

    const loadPositions = useCallback(async () => {
        try {
            setLoading(true);
            const templateId = (template as any)?.id || 1;
            const positionsData =
                await widgetsSystemApi.getWidgetPositions(templateId);
            if (positionsData.success) {
                const pos = positionsData.data || [];
                setPositions(pos);

                // Загружаем настройки для всех позиций
                const settingsPromises = pos.map((p) =>
                    widgetsSystemApi
                        .getPositionSettings(siteId, p.slug)
                        .then((res) => ({
                            slug: p.slug,
                            settings: res.data?.settings as
                                | Record<string, unknown>
                                | undefined,
                        }))
                        .catch(() => ({ slug: p.slug, settings: null })),
                );
                const settingsResults = await Promise.all(settingsPromises);
                const settingsMap: Record<string, Record<string, unknown>> = {};
                settingsResults.forEach(({ slug, settings }) => {
                    if (settings) {
                        settingsMap[slug] = settings;
                    }
                });
                setPositionSettings(settingsMap);
            }
        } catch (error) {
            console.error('Error loading positions:', error);
        } finally {
            setLoading(false);
        }
    }, [template, siteId]);

    const loadAvailableWidgets = useCallback(async () => {
        try {
            setLoadingAvailableWidgets(true);
            const widgetsData = await widgetsSystemApi.getWidgets();
            if (widgetsData.success) {
                setAvailableWidgets(widgetsData.data || []);
            }
        } catch (error) {
            console.error('Error loading available widgets:', error);
        } finally {
            setLoadingAvailableWidgets(false);
        }
    }, []);

    useEffect(() => {
        loadPositions();
    }, [loadPositions]);

    useEffect(() => {
        refreshWidgets();
    }, [refreshWidgets]);

    const handleAddWidgetToPosition = useCallback(
        async (positionSlug: string) => {
            setSelectedPosition(positionSlug);
            await loadAvailableWidgets();
            setIsWidgetSelectModalOpen(true);
        },
        [loadAvailableWidgets],
    );

    const handleSelectWidget = useCallback(
        async (widget: any) => {
            if (!selectedPosition) return;
            try {
                const newWidget = await addWidget(
                    (widget as any).widget_slug,
                    selectedPosition,
                );
                setIsWidgetSelectModalOpen(false);
                setSelectedPosition(null);
                if (newWidget) {
                    setNewlyAddedWidgetId(newWidget.id);
                    setEditingWidget(newWidget as WidgetData);
                    setIsEditModalOpen(true);
                }
            } catch (error) {
                console.error('Error adding widget:', error);
            }
        },
        [selectedPosition, addWidget],
    );

    const handleDropWidget = useCallback(
        async (item: { widget: any }, positionSlug: string) => {
            const widgetData = item.widget || item;
            const slug = widgetData.widget_slug;
            if (!slug) {
                return;
            }
            try {
                const newWidget = await addWidget(slug, positionSlug);
                if (newWidget) {
                    setNewlyAddedWidgetId(newWidget.id);
                    setEditingWidget(newWidget as WidgetData);
                    setIsEditModalOpen(true);
                }
            } catch (error) {
                console.error('Error adding widget:', error);
            }
        },
        [addWidget],
    );

    const handleEditWidget = useCallback((widget: WidgetData) => {
        setEditingWidget(widget);
        setIsEditModalOpen(true);
    }, []);

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
                throw error; // Пробрасываем ошибку дальше
            }
        },
        [updateWidget],
    );

    const handleSaveWidgetConfig = useCallback(
        async (widgetId: string, config: Record<string, unknown>) => {
            try {
                await updateWidget(widgetId, { config });
            } catch (error) {
                console.error('Error saving widget config:', error);
                throw error;
            }
        },
        [updateWidget],
    );

    const onMoveWidget = useCallback(
        async (widgetId: string, positionSlug: string) => {
            console.log('onMoveWidget called:', { widgetId, positionSlug });
            const widgetsInTarget = widgets
                .filter((w) => w.position_slug === positionSlug)
                .sort((a, b) => a.order - b.order);
            const newOrder = widgetsInTarget.length + 1;
            console.log('Moving widget to order:', newOrder);
            await sitesApi.moveWidget(siteId, parseInt(widgetId), {
                position_slug: positionSlug,
                order: newOrder,
            });
            const idx = widgets.findIndex((w) => w.id === widgetId);
            if (idx !== -1) {
                const copy: WidgetData[] = [...widgets];
                copy[idx] = {
                    ...copy[idx],
                    position_slug: positionSlug,
                    order: newOrder,
                } as WidgetData;
                onWidgetsChange?.(copy, isLoading);
            }
        },
        [widgets, siteId, onWidgetsChange, isLoading],
    );

    const onMoveWidgetOrder = useCallback(
        async (widgetId: string, positionSlug: string, order: number) => {
            try {
                await moveWidget(widgetId, positionSlug, order);
                // Не вызываем refreshWidgets, так как moveWidget уже обновляет локальное состояние
            } catch (error) {
                console.error('Error moving widget order:', error);
            }
        },
        [moveWidget],
    );

    return {
        widgets,
        positions,
        positionSettings,
        loading,
        isRightPanelOpen,
        setIsRightPanelOpen,
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
        loadPositions,
    };
};
