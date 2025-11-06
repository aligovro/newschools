import {
    widgetsSystemApi,
    type PositionVisibilityRules,
} from '@/lib/api/widgets-system';
import React, { useEffect, useState } from 'react';

export interface VisibilityPanelProps {
    siteId: number;
    widgetId: string;
    value?: PositionVisibilityRules;
    onChange: (value: PositionVisibilityRules) => void;
}

export const VisibilityPanel: React.FC<VisibilityPanelProps> = ({
    siteId,
    widgetId,
    value,
    onChange,
}) => {
    const [loading, setLoading] = useState(false);
    const [routeOptions, setRouteOptions] = useState<
        Array<{ key: string; label: string; pattern: string }>
    >([]);
    const [pageOptions, setPageOptions] = useState<
        Array<{ id: number; title: string; slug: string }>
    >([]);

    const mode = value?.mode || 'all';
    const selectedRoutes = value?.routes || [];
    const selectedPages = value?.pages || [];

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [routesRes, pagesRes] = await Promise.all([
                    widgetsSystemApi.getPositionRoutes(siteId),
                    widgetsSystemApi.getSitePages(siteId),
                ]);

                if (routesRes.success) setRouteOptions(routesRes.data || []);
                if (pagesRes.success) setPageOptions(pagesRes.data || []);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [siteId]);

    const handleModeChange = (newMode: 'all' | 'include' | 'exclude') => {
        onChange({
            ...value,
            mode: newMode,
            routes: newMode === 'all' ? [] : value?.routes || [],
            pages: newMode === 'all' ? [] : value?.pages || [],
        });
    };

    const handleRouteToggle = (routeKey: string) => {
        const currentRoutes = selectedRoutes;
        const newRoutes = currentRoutes.includes(routeKey)
            ? currentRoutes.filter((r) => r !== routeKey)
            : [...currentRoutes, routeKey];
        onChange({
            ...value,
            mode: mode === 'all' ? 'include' : mode,
            routes: newRoutes,
        });
    };

    const handlePageToggle = (pageId: number) => {
        const currentPages = selectedPages
            .map((p) =>
                typeof p === 'number' ? p : typeof p === 'object' ? p.id : null,
            )
            .filter((x): x is number => x !== null);
        const newPages = currentPages.includes(pageId)
            ? currentPages.filter((id) => id !== pageId)
            : [...currentPages, pageId];
        onChange({
            ...value,
            mode: mode === 'all' ? 'include' : mode,
            pages: newPages,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <div className="mb-2 text-sm font-medium text-gray-700">
                    Где показывать
                </div>
                <div className="mb-3 flex gap-4 text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name={`visibility-mode-${widgetId}`}
                            value="all"
                            checked={mode === 'all'}
                            onChange={() => handleModeChange('all')}
                        />
                        Везде
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name={`visibility-mode-${widgetId}`}
                            value="include"
                            checked={mode === 'include'}
                            onChange={() => handleModeChange('include')}
                        />
                        Только на выбранных
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name={`visibility-mode-${widgetId}`}
                            value="exclude"
                            checked={mode === 'exclude'}
                            onChange={() => handleModeChange('exclude')}
                        />
                        Кроме выбранных
                    </label>
                </div>

                {mode !== 'all' && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded border p-3">
                            <div className="mb-2 text-sm font-medium text-gray-700">
                                Стандартные страницы
                            </div>
                            <div className="space-y-2">
                                {routeOptions.map((r) => (
                                    <label
                                        key={r.key}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRoutes.includes(
                                                r.key,
                                            )}
                                            onChange={() =>
                                                handleRouteToggle(r.key)
                                            }
                                        />
                                        <span>{r.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="rounded border p-3">
                            <div className="mb-2 text-sm font-medium text-gray-700">
                                Страницы сайта
                            </div>
                            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                                {pageOptions.length === 0 && (
                                    <div className="text-sm text-gray-500">
                                        Страниц нет
                                    </div>
                                )}
                                {pageOptions.map((p) => {
                                    const isSelected = selectedPages.some(
                                        (sp) =>
                                            (typeof sp === 'number' &&
                                                sp === p.id) ||
                                            (typeof sp === 'object' &&
                                                sp.id === p.id),
                                    );
                                    return (
                                        <label
                                            key={p.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    handlePageToggle(p.id)
                                                }
                                            />
                                            <span>{p.title}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
