import { sitesApi } from '@/lib/api/index';
import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';

interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    slug: string;
    position_name: string;
    position_slug: string;
    order: number;
    config: Record<string, unknown>;
    settings: Record<string, unknown>;
    is_active: boolean;
    is_visible: boolean;
    created_at: string;
    updated_at?: string;
}

interface UseWidgetsReturn {
    widgets: WidgetData[];
    isLoading: boolean;
    errors: string[];
    lastAddedWidget: WidgetData | null;
    addWidget: (
        widgetSlug: string,
        positionSlug: string,
        config?: Record<string, unknown>,
    ) => Promise<WidgetData | null>;
    updateWidget: (
        widgetId: string,
        updates: Partial<WidgetData>,
    ) => Promise<void>;
    deleteWidget: (widgetId: string) => Promise<void>;
    moveWidget: (
        widgetId: string,
        positionSlug: string,
        order: number,
    ) => Promise<void>;
    refreshWidgets: () => Promise<void>;
}

export const useWidgets = (
    siteId: number,
    initialWidgets: WidgetData[] = [],
): UseWidgetsReturn => {
    const [widgets, setWidgets] = useState<WidgetData[]>(initialWidgets);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [lastAddedWidget, setLastAddedWidget] = useState<WidgetData | null>(
        null,
    );

    const addWidget = useCallback(
        async (
            widgetSlug: string,
            positionSlug: string,
            config: Record<string, unknown> = {},
        ): Promise<WidgetData | null> => {
            setIsLoading(true);
            setErrors([]);
            setLastAddedWidget(null);

            try {
                const data = await sitesApi.addWidget(siteId, {
                    widget_slug: widgetSlug,
                    position_slug: positionSlug,
                    config,
                });

                console.log('AddWidget response:', data);

                if (data.success && data.widget) {
                    console.log('Виджет добавлен');
                    const newWidget = data.widget as WidgetData;
                    setWidgets((prev) => {
                        // Проверяем, нет ли уже такого виджета
                        const exists = prev.some((w) => w.id === newWidget.id);
                        if (exists) {
                            return prev;
                        }
                        return [...prev, newWidget];
                    });
                    setLastAddedWidget(newWidget);
                    return newWidget;
                } else {
                    setErrors([
                        data.message || 'Ошибка при добавлении виджета',
                    ]);
                    return null;
                }
            } catch (error) {
                console.error('Ошибка при добавлении виджета:', error);
                setErrors(['Ошибка при добавлении виджета']);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [siteId],
    );

    const updateWidget = useCallback(
        async (widgetId: string, updates: Partial<WidgetData>) => {
            setIsLoading(true);
            setErrors([]);

            try {
                const data = await sitesApi.updateWidget(
                    siteId,
                    parseInt(widgetId),
                    updates,
                );

                if (data.success) {
                    console.log('Виджет обновлен');
                    // Если есть обновленный виджет в ответе, используем его, иначе обновляем локально
                    if (data.widget) {
                        const updatedWidget = data.widget as WidgetData;
                        setWidgets((prev) =>
                            prev.map((w) =>
                                w.id === widgetId ? updatedWidget : w,
                            ),
                        );
                    } else {
                        // Обновляем локально только измененные поля
                        setWidgets((prev) =>
                            prev.map((w) =>
                                w.id === widgetId ? { ...w, ...updates } : w,
                            ),
                        );
                    }
                } else {
                    setErrors([
                        data.message || 'Ошибка при обновлении виджета',
                    ]);
                }
            } catch (error) {
                console.error('Ошибка при обновлении виджета:', error);
                setErrors(['Ошибка при обновлении виджета']);
            } finally {
                setIsLoading(false);
            }
        },
        [siteId],
    );

    const deleteWidget = useCallback(
        async (widgetId: string) => {
            setIsLoading(true);
            setErrors([]);

            try {
                await router.delete(
                    `/dashboard/sites/${siteId}/widgets/${widgetId}`,
                    {
                        onSuccess: () => {
                            console.log('Виджет удален');
                            setWidgets((prev) =>
                                prev.filter((w) => w.id !== widgetId),
                            );
                        },
                        onError: (errors) => {
                            const errorMessages = Object.values(errors).flat();
                            setErrors(errorMessages);
                        },
                        onFinish: () => {
                            setIsLoading(false);
                        },
                    },
                );
            } catch (error) {
                console.error('Ошибка при удалении виджета:', error);
                setErrors(['Ошибка при удалении виджета']);
                setIsLoading(false);
            }
        },
        [siteId],
    );

    const moveWidget = useCallback(
        async (widgetId: string, positionSlug: string, order: number) => {
            setIsLoading(true);
            setErrors([]);

            try {
                await router.post(
                    `/dashboard/sites/${siteId}/widgets/${widgetId}/move`,
                    {
                        position_slug: positionSlug,
                        order,
                    },
                    {
                        onSuccess: (page) => {
                            console.log('Виджет перемещен');
                            // Обновляем локальное состояние
                            if (page.props.widget) {
                                setWidgets((prev) =>
                                    prev.map((w) =>
                                        w.id === widgetId
                                            ? page.props.widget
                                            : w,
                                    ),
                                );
                            }
                        },
                        onError: (errors) => {
                            const errorMessages = Object.values(errors).flat();
                            setErrors(errorMessages);
                        },
                        onFinish: () => {
                            setIsLoading(false);
                        },
                    },
                );
            } catch (error) {
                console.error('Ошибка при перемещении виджета:', error);
                setErrors(['Ошибка при перемещении виджета']);
                setIsLoading(false);
            }
        },
        [siteId],
    );

    const refreshWidgets = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);

        try {
            await router.get(
                `/dashboard/sites/${siteId}/config`,
                {},
                {
                    onSuccess: (page) => {
                        if (page.props.data) {
                            setWidgets(page.props.data);
                        }
                    },
                    onError: (errors) => {
                        const errorMessages = Object.values(errors).flat();
                        setErrors(errorMessages);
                    },
                    onFinish: () => {
                        setIsLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error('Ошибка при загрузке виджетов:', error);
            setErrors(['Ошибка при загрузке виджетов']);
            setIsLoading(false);
        }
    }, [siteId]);

    // Мемоизируем виджеты для предотвращения лишних ререндеров
    const memoizedWidgets = useMemo(() => widgets, [widgets]);

    return {
        widgets: memoizedWidgets,
        isLoading,
        errors,
        lastAddedWidget,
        addWidget,
        updateWidget,
        deleteWidget,
        moveWidget,
        refreshWidgets,
    };
};
