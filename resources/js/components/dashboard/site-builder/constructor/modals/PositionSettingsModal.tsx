import { widgetsSystemApi, type PositionVisibilityRules } from '@/lib/api/widgets-system';
import React, { useEffect, useMemo, useState } from 'react';

type WidgetPosition = {
    id: number;
    name: string;
    slug: string;
    area: string;
    layout_config?: Record<string, unknown>;
};

interface PositionSettingsModalProps {
    open: boolean;
    onClose: () => void;
    siteId: number;
    position: WidgetPosition;
}

export const PositionSettingsModal: React.FC<PositionSettingsModalProps> = ({ open, onClose, siteId, position }) => {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [width, setWidth] = useState<string>('full');
    const [alignment, setAlignment] = useState<string>('center');
    const [cssClass, setCssClass] = useState<string>('');
    const [mode, setMode] = useState<'all' | 'include' | 'exclude'>('all');
    const [routeOptions, setRouteOptions] = useState<Array<{ key: string; label: string; pattern: string }>>([]);
    const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
    const [pageOptions, setPageOptions] = useState<Array<{ id: number; title: string; slug: string }>>([]);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);

    useEffect(() => {
        if (!open) return;
        const init = async () => {
            try {
                setLoading(true);
                const [routesRes, pagesRes, settingsRes] = await Promise.all([
                    widgetsSystemApi.getPositionRoutes(siteId),
                    widgetsSystemApi.getSitePages(siteId),
                    widgetsSystemApi.getPositionSettings(siteId, position.slug),
                ]);

                if (routesRes.success) setRouteOptions(routesRes.data || []);
                if (pagesRes.success) setPageOptions(pagesRes.data || []);

                const layoutFromPosition = (position.layout_config || {}) as Record<string, any>;
                setWidth((layoutFromPosition.width as string) || 'full');
                setAlignment((layoutFromPosition.alignment as string) || 'center');

                if (settingsRes.success && settingsRes.data?.settings) {
                    const s = settingsRes.data.settings;
                    const layout = (s.layout_overrides || {}) as Record<string, any>;
                    if (layout.width) setWidth(String(layout.width));
                    if (layout.alignment) setAlignment(String(layout.alignment));
                    if (layout.css_class) setCssClass(String(layout.css_class));

                    const vis = (s.visibility_rules || {}) as PositionVisibilityRules;
                    setMode((vis.mode as any) || 'all');
                    setSelectedRoutes(vis.routes || []);
                    const ids = (vis.pages || [])
                        .map((p) => (typeof p === 'number' ? p : typeof p === 'string' ? null : (p as any).id))
                        .filter((x): x is number => !!x);
                    setSelectedPages(ids);
                } else {
                    // Defaults
                    setMode('all');
                    setSelectedRoutes([]);
                    setSelectedPages([]);
                }
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [open, siteId, position.slug, position.layout_config]);

    const canSave = useMemo(() => !saving && !loading, [saving, loading]);

    const handleSave = async () => {
        if (!canSave) return;
        try {
            setSaving(true);
            await widgetsSystemApi.savePositionSettings(siteId, position.slug, {
                layout: { width, alignment, css_class: cssClass },
                visibility: {
                    mode,
                    routes: selectedRoutes,
                    pages: selectedPages,
                },
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
                <div className="flex flex-shrink-0 items-center justify-between border-b px-6 py-4">
                    <h3 className="text-lg font-semibold">Настройки позиции: {position.name}</h3>
                    <button onClick={onClose} className="rounded p-1 hover:bg-gray-100" aria-label="Закрыть">
                        ✕
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
                    <div className={
                        ['header-col-1', 'header-col-2', 'header-col-3', 'header-col-4', 
                         'footer-col-1', 'footer-col-2', 'footer-col-3', 'footer-col-4'].includes(position.slug)
                            ? 'hidden'
                            : ''
                    }>
                        <div className="mb-2 text-sm font-medium text-gray-700">Макет</div>
                        <div className="flex items-center gap-3">
                            <select className="rounded border px-3 py-2 text-sm" value={width} onChange={(e) => setWidth(e.target.value)}>
                                <option value="full">Полная ширина</option>
                                <option value="boxed">Ограниченная</option>
                            </select>
                            <select className="rounded border px-3 py-2 text-sm" value={alignment} onChange={(e) => setAlignment(e.target.value)}>
                                <option value="left">Слева</option>
                                <option value="center">По центру</option>
                                <option value="right">Справа</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            CSS класс
                        </label>
                        <input
                            type="text"
                            value={cssClass}
                            onChange={(e) => setCssClass(e.target.value)}
                            placeholder="my-custom-class"
                            className="w-full rounded border px-3 py-2 text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Класс будет добавлен с префиксом "position-{position.slug}-"
                        </p>
                    </div>

                    <div>
                        <div className="mb-2 text-sm font-medium text-gray-700">Где показывать</div>
                        <div className="mb-3 flex gap-4 text-sm">
                            <label className="flex items-center gap-2"><input type="radio" name="mode" value="all" checked={mode === 'all'} onChange={() => setMode('all')} /> Везде</label>
                            <label className="flex items-center gap-2"><input type="radio" name="mode" value="include" checked={mode === 'include'} onChange={() => setMode('include')} /> Только на выбранных</label>
                            <label className="flex items-center gap-2"><input type="radio" name="mode" value="exclude" checked={mode === 'exclude'} onChange={() => setMode('exclude')} /> Кроме выбранных</label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded border p-3">
                                <div className="mb-2 text-sm font-medium text-gray-700">Стандартные страницы</div>
                                <div className="space-y-2">
                                    {routeOptions.map((r) => (
                                        <label key={r.key} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedRoutes.includes(r.key)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setSelectedRoutes((prev) =>
                                                        checked ? Array.from(new Set([...prev, r.key])) : prev.filter((k) => k !== r.key),
                                                    );
                                                }}
                                            />
                                            <span>{r.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded border p-3">
                                <div className="mb-2 text-sm font-medium text-gray-700">Страницы сайта</div>
                                <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                                    {pageOptions.length === 0 && (
                                        <div className="text-sm text-gray-500">Страниц нет</div>
                                    )}
                                    {pageOptions.map((p) => (
                                        <label key={p.id} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedPages.includes(p.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setSelectedPages((prev) =>
                                                        checked ? Array.from(new Set([...prev, p.id])) : prev.filter((id) => id !== p.id),
                                                    );
                                                }}
                                            />
                                            <span>{p.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t px-6 py-4">
                    <button className="rounded border px-4 py-2 text-sm" onClick={onClose} disabled={saving}>Отмена</button>
                    <button
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        onClick={handleSave}
                        disabled={!canSave}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};


