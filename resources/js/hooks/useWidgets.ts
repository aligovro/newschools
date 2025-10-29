import { sitesApi } from '@/lib/api/index';
import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';

interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    widget_slug: string;
    position_name: string;
    position_slug: string;
    order: number;
    config: Record<string, unknown>;
    configs: Array<{
        config_key: string;
        config_value: string;
        config_type: string;
    }>;
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

                if (data.success && data.widget) {
                    const newWidget = data.widget as unknown as WidgetData;
                    setWidgets((prev) => {
                        const exists = prev.some(
                            (w) => String(w.id) === String(newWidget.id),
                        );
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
                    updates as Record<string, unknown>,
                );

                if (data.success) {
                    if (data.widget) {
                        const updatedWidget =
                            data.widget as unknown as WidgetData;
                        setWidgets((prev) =>
                            prev.map((w) =>
                                String(w.id) === String(widgetId)
                                    ? updatedWidget
                                    : w,
                            ),
                        );
                    } else {
                        setWidgets((prev) =>
                            prev.map((w) =>
                                String(w.id) === String(widgetId)
                                    ? { ...w, ...updates }
                                    : w,
                            ),
                        );
                    }
                } else {
                    console.error('useWidgets: updateWidget failed', {
                        message: data.message,
                        errors: data.errors,
                    });
                    setErrors([
                        data.message || 'Ошибка при обновлении виджета',
                    ]);
                    // Пробрасываем ошибку дальше с полной информацией
                    const errorToThrow = new Error(
                        data.message || 'Ошибка при обновлении виджета',
                    ) as any;
                    errorToThrow.response = {
                        data: {
                            message: data.message,
                            errors: data.errors || [],
                        },
                    };
                    throw errorToThrow;
                }
            } catch (error: any) {
                console.error('Ошибка при обновлении виджета:', error);
                setErrors(['Ошибка при обновлении виджета']);
                // Пробрасываем ошибку дальше
                throw error;
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
                            setWidgets((prev) =>
                                prev.filter(
                                    (w) => String(w.id) !== String(widgetId),
                                ),
                            );
                        },
                        onError: (errors) => {
                            const errorMessages = Object.values(errors).flat();
                            setErrors(errorMessages as string[]);
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
                const result = await sitesApi.moveWidget(
                    siteId,
                    parseInt(widgetId),
                    {
                        position_slug: positionSlug,
                        order,
                    },
                );

                if (result.success) {
                    // Обновляем локальное состояние - меняем порядок виджетов в позиции
                    setWidgets((prev) => {
                        // Находим перемещаемый виджет во всех позициях
                        const movingWidget = prev.find(
                            (w) => String(w.id) === String(widgetId),
                        );

                        if (!movingWidget) {
                            return prev;
                        }

                        // Получаем виджеты в целевой позиции (исключая перемещаемый)
                        const widgetsInTargetPosition = prev.filter(
                            (w) =>
                                w.position_slug === positionSlug &&
                                String(w.id) !== String(widgetId),
                        );

                        // Получаем виджеты в других позициях (исключая перемещаемый)
                        const widgetsInOtherPositions = prev.filter(
                            (w) =>
                                w.position_slug !== positionSlug &&
                                String(w.id) !== String(widgetId),
                        );

                        // Сортируем виджеты в целевой позиции по порядку
                        const sortedTargetWidgets =
                            widgetsInTargetPosition.sort(
                                (a, b) => a.order - b.order,
                            );

                        // Вставляем перемещаемый виджет в нужную позицию
                        sortedTargetWidgets.splice(order - 1, 0, {
                            ...movingWidget,
                            position_slug: positionSlug,
                        });

                        // Обновляем порядок всех виджетов в целевой позиции
                        const updatedTargetWidgets = sortedTargetWidgets.map(
                            (w, index) => ({
                                ...w,
                                order: index + 1,
                            }),
                        );

                        const result = [
                            ...widgetsInOtherPositions,
                            ...updatedTargetWidgets,
                        ];
                        return result;
                    });
                } else {
                    setErrors([
                        result.message || 'Ошибка при перемещении виджета',
                    ]);
                }
            } catch (error) {
                console.error('Ошибка при перемещении виджета:', error);
                setErrors(['Ошибка при перемещении виджета']);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        },
        [siteId],
    );

    const refreshWidgets = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);

        try {
            const { widgets: data } = await sitesApi.getConfig(siteId);
            setWidgets(data as WidgetData[]);
        } catch (error) {
            console.error('Ошибка при загрузке виджетов:', error);
            setErrors(['Ошибка при загрузке виджетов']);
        } finally {
            setIsLoading(false);
        }
    }, [siteId]);

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
