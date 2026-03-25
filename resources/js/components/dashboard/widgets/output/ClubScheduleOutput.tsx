import { fetchOrganizationClubs, submitClubApplication } from '@/lib/api/public';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ClubSignUpModal } from '../ClubSignUpModal';
import {
    CLUB_SCHEDULE_DAYS,
    type ClubScheduleItem,
    getClubScheduleCellValue,
} from './clubScheduleShared';
import { WidgetOutputProps } from './types';

const INITIAL_VISIBLE = 5;
const LOAD_MORE_STEP = 5;

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
    const providedClubs = Array.isArray(cfg.clubs)
        ? (cfg.clubs as ClubScheduleItem[])
        : [];

    const [clubs, setClubs] = useState<ClubScheduleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
    const [signUpClub, setSignUpClub] = useState<ClubScheduleItem | null>(null);

    const displayClubs = useMemo(
        () => (providedClubs.length > 0 ? providedClubs : clubs),
        [providedClubs, clubs],
    );

    const clubPageBaseUrl = (cfg.club_page_base_url as string) || '';
    const getClubPageUrl = useCallback(
        (club: ClubScheduleItem) =>
            clubPageBaseUrl
                ? `${clubPageBaseUrl.replace(/\/$/, '')}/club/${club.id}`
                : `/club/${club.id}`,
        [clubPageBaseUrl],
    );

    const hasData = displayClubs.length > 0;
    const visibleClubs = useMemo(
        () => displayClubs.slice(0, visibleCount),
        [displayClubs, visibleCount],
    );
    const hasMore = visibleCount < displayClubs.length;

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
                const list: ClubScheduleItem[] = Array.isArray(payload?.data)
                    ? payload.data.map((c: Record<string, unknown>) => ({
                          id: Number(c.id),
                          name: String(c.name ?? ''),
                          schedule: (c.schedule as ClubScheduleItem['schedule']) ?? {},
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

    const loadMore = useCallback(() => {
        setVisibleCount((n) => Math.min(n + LOAD_MORE_STEP, displayClubs.length));
    }, [displayClubs.length]);

    const handleSignUpSubmit = useCallback(async (payload: import('../ClubSignUpModal').ClubSignUpPayload) => {
        await submitClubApplication({
            club_id:         payload.clubId,
            organization_id: payload.organizationId,
            club_name:       payload.clubName,
            name:            payload.name,
            phone:           payload.phone,
            email:           payload.email,
            comment:         payload.comment,
        });
    }, []);

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
                <div className="club-schedule-output__placeholder">
                    <span className="club-schedule-output__placeholder-text">
                        Загрузка…
                    </span>
                </div>
            )}

            {error && !loading && (
                <div className="club-schedule-output__error">{error}</div>
            )}

            {!loading && !error && !hasData && (
                <div className="club-schedule-output__placeholder">
                    <span className="club-schedule-output__placeholder-text">
                        Расписание не настроено
                    </span>
                </div>
            )}

            {!loading && !error && hasData && (
                <>
                    <div className="club-schedule-output__grid-wrapper" role="table" aria-label="Расписание кружков и секций">
                        <div className="club-schedule-output__row club-schedule-output__row--head" role="row">
                            <div className="club-schedule-output__cell club-schedule-output__cell--head-name" role="columnheader">
                                Кружки и секции
                            </div>
                            {CLUB_SCHEDULE_DAYS.map(({ label }) => (
                                <div key={label} className="club-schedule-output__cell club-schedule-output__cell--head-day" role="columnheader">
                                    {label}
                                </div>
                            ))}
                        </div>
                        {visibleClubs.map((club, rowIndex) => (
                            <div
                                key={club.id}
                                className={`club-schedule-output__row ${rowIndex % 2 === 0 ? 'club-schedule-output__row--alt' : ''}`.trim()}
                                role="row"
                            >
                                <div className="club-schedule-output__cell club-schedule-output__cell--name" role="cell">
                                    <a
                                        href={getClubPageUrl(club)}
                                        className="club-schedule-output__icon"
                                        aria-label={`Страница кружка: ${club.name}`}
                                    >
                                        <img src="/icons/school-template/arrow-up-right.svg" alt="" />
                                    </a>
                                    <span className="club-schedule-output__name">{club.name}</span>
                                    <button
                                        type="button"
                                        className="club-schedule-output__btn-signup"
                                        onClick={() => setSignUpClub(club)}
                                    >
                                        Записаться
                                    </button>
                                </div>
                                {CLUB_SCHEDULE_DAYS.map(({ key }) => {
                                    const value = getClubScheduleCellValue(club.schedule, key);
                                    const isEmpty = value === '—';
                                    return (
                                        <div key={key} className="club-schedule-output__cell club-schedule-output__cell--day" role="cell">
                                            <span className={isEmpty ? 'club-schedule-output__day-value club-schedule-output__day-value--empty' : 'club-schedule-output__day-value'}>
                                                {value}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    {hasMore && (
                        <button
                            type="button"
                            className="club-schedule-output__load-more"
                            onClick={loadMore}
                        >
                            Загрузить больше
                        </button>
                    )}
                </>
            )}

            {signUpClub && (
                <ClubSignUpModal
                    open={!!signUpClub}
                    onOpenChange={(open) => !open && setSignUpClub(null)}
                    club={{ id: signUpClub.id, name: signUpClub.name }}
                    organizationId={organization_id}
                    onSubmit={handleSignUpSubmit}
                />
            )}
        </div>
    );
};

export default ClubScheduleOutput;
