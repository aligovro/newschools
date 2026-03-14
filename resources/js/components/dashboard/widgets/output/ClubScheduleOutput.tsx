import { fetchOrganizationClubs } from '@/lib/api/public';
import React, { useEffect, useMemo, useState } from 'react';
import { WidgetOutputProps } from './types';

interface ClubSchedule {
    mon?: string | null;
    tue?: string | null;
    wed?: string | null;
    thu?: string | null;
    fri?: string | null;
    sat?: string | null;
    sun?: string | null;
}

interface Club {
    id: number;
    name: string;
    schedule?: ClubSchedule;
}

const DAYS: Array<{ key: keyof ClubSchedule; label: string }> = [
    { key: 'mon', label: 'Пн' },
    { key: 'tue', label: 'Вт' },
    { key: 'wed', label: 'Ср' },
    { key: 'thu', label: 'Чт' },
    { key: 'fri', label: 'Пт' },
    { key: 'sat', label: 'Сб' },
    { key: 'sun', label: 'Вс' },
];

function parseOrgId(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : undefined;
}

export const ClubScheduleOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const cfg = (widget.config || {}) as Record<string, unknown>;
    const configs = (widget as {
        configs?: Array<{ config_key: string; config_value: string; config_type: string }>;
    }).configs;

    const fromConfigs = configs?.find(
        (c) =>
            c.config_key === 'organization_id' ||
            c.config_key === 'organizationId',
    );

    const organization_id =
        parseOrgId(cfg.organization_id) ??
        parseOrgId(cfg.organizationId) ??
        (fromConfigs
            ? parseOrgId(
                  fromConfigs.config_type === 'number'
                      ? parseFloat(fromConfigs.config_value)
                      : fromConfigs.config_value,
              )
            : undefined);

    const title =
        (cfg.title as string) || 'Расписание кружков и секций';
    const show_title = (cfg.show_title as boolean) ?? true;
    const providedClubs = Array.isArray(cfg.clubs) ? (cfg.clubs as Club[]) : [];

    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const displayClubs = useMemo(
        () => (providedClubs.length > 0 ? providedClubs : clubs),
        [providedClubs, clubs],
    );

    const hasData = displayClubs.length > 0;

    useEffect(() => {
        if (providedClubs.length > 0 || !organization_id) return;

        const controller = new AbortController();

        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const payload = await fetchOrganizationClubs(
                    { organization_id, limit: 50 },
                    { signal: controller.signal },
                );
                const list: Club[] = Array.isArray(payload?.data)
                    ? payload.data.map((c: Record<string, unknown>) => ({
                          id: Number(c.id),
                          name: String(c.name ?? ''),
                          schedule: (c.schedule as ClubSchedule) ?? {},
                      }))
                    : [];
                setClubs(list);
            } catch (e: unknown) {
                if ((e as { name?: string })?.name !== 'AbortError') {
                    setError(
                        e instanceof Error
                            ? e.message
                            : 'Не удалось загрузить расписание',
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        run();
        return () => controller.abort();
    }, [organization_id, providedClubs.length]);

    const getCellValue = (club: Club, dayKey: keyof ClubSchedule): string => {
        const v = club.schedule?.[dayKey];
        return v && String(v).trim() ? String(v) : '—';
    };

    return (
        <div
            className={`club-schedule-output ${className || ''}`.trim()}
            style={style}
        >
            {title && show_title && (
                <div className="block__header">
                    <h2 className="block__title">{title}</h2>
                </div>
            )}

            {loading && (
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">Загрузка…</span>
                </div>
            )}

            {error && !loading && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && !hasData && (
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Расписание не настроено
                    </span>
                </div>
            )}

            {!loading && !error && hasData && (
                <div className="club-schedule-output__table overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="w-full min-w-[600px] border-collapse">
                        <thead>
                            <tr>
                                <th
                                    scope="col"
                                    className="border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-900"
                                >
                                    Кружки и секции
                                </th>
                                {DAYS.map(({ key, label }) => (
                                    <th
                                        key={key}
                                        scope="col"
                                        className="border-b border-gray-200 bg-gray-50 px-3 py-3 text-center text-sm font-semibold text-gray-700"
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayClubs.map((club, idx) => (
                                <tr
                                    key={club.id}
                                    className={
                                        idx % 2 === 0
                                            ? 'bg-white'
                                            : 'bg-gray-50/50'
                                    }
                                >
                                    <td className="border-b border-r border-gray-200 px-4 py-3 font-medium text-gray-900">
                                        {club.name}
                                    </td>
                                    {DAYS.map(({ key }) => (
                                        <td
                                            key={key}
                                            className="border-b border-gray-200 px-3 py-3 text-center text-gray-600"
                                        >
                                            {getCellValue(club, key)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClubScheduleOutput;
