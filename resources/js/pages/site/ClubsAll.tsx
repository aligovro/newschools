import { ClubSignUpModal } from '@/components/dashboard/widgets/ClubSignUpModal';
import type { ClubSignUpPayload } from '@/components/dashboard/widgets/ClubSignUpModal';
import type { WidgetData, WidgetPosition } from '@/components/dashboard/site-builder/types';
import { fetchOrganizationClubs, submitClubApplication } from '@/lib/api/public';
import { SchoolCtaPill } from '@/components/site/school/SchoolCtaPill';
import MainLayout from '@/layouts/MainLayout';
import React, { useCallback, useState } from 'react';

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
    organization_id?: number;
    name: string;
    description?: string | null;
    image?: string | null;
    schedule?: ClubSchedule | null;
}

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    favicon?: string;
    template: string;
    site_type: string;
    organization_id?: number;
    widgets_config: WidgetData[];
    seo_config?: Record<string, unknown>;
    layout_config?: { sidebar_position?: 'left' | 'right' };
    custom_css?: string | null;
}

interface Props {
    site: Site;
    clubs: Club[];
    total: number;
    has_more: boolean;
    per_page: number;
    positions?: WidgetPosition[];
    position_settings?: Array<{
        position_slug: string;
        visibility_rules?: Record<string, unknown>;
        layout_overrides?: Record<string, unknown>;
    }>;
    seo?: { title?: string; description?: string };
}

const DAY_LABELS: Record<keyof ClubSchedule, string> = {
    mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт',
    fri: 'Пт', sat: 'Сб', sun: 'Вс',
};
const SCHEDULE_DAYS = Object.keys(DAY_LABELS) as (keyof ClubSchedule)[];

function formatSchedule(schedule?: ClubSchedule | null): {
    timeText: string | null;
    byAppointment: boolean;
} {
    if (!schedule || typeof schedule !== 'object') {
        return { timeText: null, byAppointment: true };
    }
    const slots = SCHEDULE_DAYS
        .filter((d) => schedule[d] && String(schedule[d]).trim())
        .map((d) => ({ day: d, value: String(schedule[d]!).trim() }));

    if (slots.length === 0) return { timeText: null, byAppointment: true };

    const daysStr  = slots.map((s) => DAY_LABELS[s.day]).join(', ');
    const timeStr  = slots[0].value.replace(/[–-]/g, ' до ').replace(/^(\d+:\d+)/, 'с $1');
    return { timeText: `${timeStr} – ${daysStr}`, byAppointment: true };
}

export default function ClubsAll({
    site,
    clubs: initialClubs,
    total,
    has_more: initialHasMore,
    per_page: perPage,
    positions = [],
    position_settings = [],
    seo,
}: Props) {
    const [clubs, setClubs]       = useState<Club[]>(initialClubs);
    const [hasMore, setHasMore]   = useState(initialHasMore);
    const [loading, setLoading]   = useState(false);
    const [signUpClub, setSignUpClub] = useState<Club | null>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore || !site.organization_id) return;
        setLoading(true);
        try {
            const result = await fetchOrganizationClubs({
                organization_id: site.organization_id,
                limit: perPage,
                offset: clubs.length,
            });
            const next = (result.data ?? []) as Club[];
            setClubs((prev) => [...prev, ...next]);
            setHasMore(result.has_more ?? false);
        } finally {
            setLoading(false);
        }
    }, [clubs.length, hasMore, loading, perPage, site.organization_id]);

    const handleSignUpSubmit = useCallback(async (payload: ClubSignUpPayload) => {
        await submitClubApplication({
            club_id:         payload.clubId,
            organization_id: payload.organizationId ?? site.organization_id,
            club_name:       payload.clubName,
            name:            payload.name,
            phone:           payload.phone,
            email:           payload.email,
            comment:         payload.comment,
        });
    }, [site.organization_id]);

    const pageTitle = seo?.title ?? `Кружки и секции — ${site.name}`;

    return (
        <>
            <MainLayout
                site={site}
                positions={positions}
                position_settings={position_settings}
                seo={seo}
                pageTitle={pageTitle}
                breadcrumbs={[
                    { title: 'Главная', href: '/' },
                    { title: 'Кружки и секции', href: '' },
                ]}
            >
                <section className="clubs-all">
                    <h1 className="clubs-all__title">Кружки и секции</h1>

                    {clubs.length === 0 && !loading && (
                        <p className="clubs-all__empty">Кружки и секции не добавлены</p>
                    )}

                    {clubs.length > 0 && (
                        <div className="clubs-all__grid">
                            {clubs.map((club) => {
                                const imgUrl =
                                    club.image &&
                                    !String(club.image).startsWith('blob:') &&
                                    String(club.image).trim()
                                        ? club.image
                                        : null;
                                const { timeText, byAppointment } = formatSchedule(club.schedule);

                                return (
                                    <div key={club.id} className="clubs-slider-widget__card">
                                        <div className="clubs-slider-widget__card-inner">
                                            <div className="clubs-slider-widget__card-content">
                                                <h3 className="clubs-slider-widget__card-title">
                                                    {club.name}
                                                </h3>
                                                <div className="clubs-slider-widget__badges">
                                                    {timeText && (
                                                        <span className="clubs-slider-widget__badge clubs-slider-widget__badge--time">
                                                            {timeText}
                                                        </span>
                                                    )}
                                                    {byAppointment && (
                                                        <span className="clubs-slider-widget__badge clubs-slider-widget__badge--appointment">
                                                            По предварительной записи
                                                        </span>
                                                    )}
                                                </div>
                                                {club.description && (
                                                    <p className="clubs-slider-widget__card-desc">
                                                        {club.description}
                                                    </p>
                                                )}
                                                <div className="clubs-slider-widget__actions">
                                                    <button
                                                        type="button"
                                                        className="clubs-slider-widget__btn clubs-slider-widget__btn--outline"
                                                        onClick={() => setSignUpClub(club)}
                                                    >
                                                        Отправить заявку
                                                    </button>
                                                    <a
                                                        href={`/club/${club.id}`}
                                                        className="clubs-slider-widget__btn clubs-slider-widget__btn--icon"
                                                        aria-label={`Страница секции: ${club.name}`}
                                                    >
                                                        <img
                                                            src="/icons/school-template/arrow-up-right.svg"
                                                            alt=""
                                                            width={24}
                                                            height={24}
                                                        />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="clubs-slider-widget__card-image-wrap">
                                                {imgUrl ? (
                                                    <img
                                                        src={imgUrl}
                                                        alt={club.name}
                                                        className="clubs-slider-widget__card-image"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="clubs-slider-widget__card-image-placeholder" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {hasMore && (
                        <div className="clubs-all__load-more">
                            <SchoolCtaPill
                                type="button"
                                onClick={loadMore}
                                disabled={loading}
                            >
                                {loading ? 'Загрузка…' : 'Загрузить ещё'}
                            </SchoolCtaPill>
                        </div>
                    )}
                </section>
            </MainLayout>

            {signUpClub && (
                <ClubSignUpModal
                    open={signUpClub !== null}
                    onOpenChange={(open) => !open && setSignUpClub(null)}
                    club={{ id: signUpClub.id, name: signUpClub.name }}
                    organizationId={site.organization_id}
                    onSubmit={handleSignUpSubmit}
                />
            )}
        </>
    );
}
