import { ClubSignUpModal } from '@/components/dashboard/widgets/ClubSignUpModal';
import type { ClubSignUpPayload } from '@/components/dashboard/widgets/ClubSignUpModal';
import { fetchOrganizationClubs, submitClubApplication } from '@/lib/api/public';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

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
    description?: string | null;
    image?: string | null;
    schedule?: ClubSchedule;
}

interface ClubsSliderConfig {
    title?: string;
    show_title?: boolean;
    organization_id?: number;
    limit?: number;
    clubs?: Club[];
}

const DAY_LABELS: Record<keyof ClubSchedule, string> = {
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
    sun: 'Вс',
};

const SCHEDULE_DAYS = Object.keys(DAY_LABELS) as (keyof ClubSchedule)[];

function formatSchedule(schedule?: ClubSchedule | null): {
    timeText: string | null;
    byAppointment: boolean;
} {
    if (!schedule || typeof schedule !== 'object') {
        return { timeText: null, byAppointment: true };
    }

    const slots: Array<{ day: keyof ClubSchedule; value: string }> = [];
    for (const day of SCHEDULE_DAYS) {
        const v = schedule[day];
        if (v && String(v).trim()) slots.push({ day, value: String(v).trim() });
    }

    if (slots.length === 0) {
        return { timeText: null, byAppointment: true };
    }

    const first = slots[0];
    const daysStr = slots.map((s) => DAY_LABELS[s.day]).join(', ');
    const timeStr = first.value
        .replace(/[–-]/g, ' до ')
        .replace(/^(\d+:\d+)/, 'с $1');
    return { timeText: `${timeStr} – ${daysStr}`, byAppointment: true };
}

interface Props {
    config?: ClubsSliderConfig;
}

export const ClubsSliderWidget: React.FC<Props> = ({ config = {} }) => {
    const {
        title = 'Кружки и секции',
        show_title = true,
        organization_id,
        limit = 12,
        clubs: providedClubs = [],
    } = config;

    const [fetched, setFetched] = useState<Club[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [signUpClub, setSignUpClub] = useState<Club | null>(null);

    const swiperRef = useRef<SwiperType | null>(null);
    const navigationPrevRef = useRef<HTMLButtonElement>(null);
    const navigationNextRef = useRef<HTMLButtonElement>(null);

    const displayClubs = useMemo(() => {
        const list = providedClubs.length > 0 ? providedClubs : fetched || [];
        return limit > 0 ? list.slice(0, limit) : list;
    }, [providedClubs, fetched, limit]);

    const hasData = displayClubs.length > 0;
    const slidesPerView = 2;
    const shouldShowArrows = displayClubs.length > slidesPerView;

    useEffect(() => {
        if (providedClubs.length > 0 || !organization_id || organization_id < 1) {
            if (providedClubs.length > 0) setFetched([]);
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const payload = await fetchOrganizationClubs(
                    { organization_id, limit: Math.min(limit, 50) },
                    { signal: controller.signal },
                );
                const list: Club[] = Array.isArray(payload?.data)
                    ? payload.data.map((c: Record<string, unknown>) => ({
                          id: Number(c.id),
                          name: String(c.name ?? ''),
                          description: (c.description as string) ?? null,
                          image: (c.image as string) ?? null,
                          schedule: (c.schedule as ClubSchedule) ?? undefined,
                      }))
                    : [];
                setFetched(list);
            } catch (e: unknown) {
                if ((e as { name?: string })?.name !== 'AbortError') {
                    setError(
                        e instanceof Error
                            ? e.message
                            : 'Не удалось загрузить кружки',
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        run();
        return () => controller.abort();
    }, [organization_id, limit, providedClubs.length]);

    useEffect(() => {
        const swiper = swiperRef.current;
        const prevEl = navigationPrevRef.current;
        const nextEl = navigationNextRef.current;
        if (!swiper || !shouldShowArrows || !prevEl || !nextEl) return;
        const nav = swiper.params.navigation;
        if (nav && typeof nav !== 'boolean') {
            nav.prevEl = prevEl;
            nav.nextEl = nextEl;
        }
        swiper.navigation?.destroy?.();
        swiper.navigation?.init?.();
        swiper.navigation?.update?.();
    }, [shouldShowArrows, displayClubs.length]);

    const renderCard = useCallback(
        (club: Club) => {
            const imgUrl =
                club.image &&
                !String(club.image).startsWith('blob:') &&
                String(club.image).trim()
                    ? club.image
                    : null;
            const { timeText, byAppointment } = formatSchedule(club.schedule);

            return (
                <div className="clubs-slider-widget__card">
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
        },
        [setSignUpClub],
    );

    const handleSignUpSubmit = useCallback(
        async (payload: ClubSignUpPayload) => {
            await submitClubApplication({
                club_id:         payload.clubId,
                organization_id: payload.organizationId ?? organization_id,
                club_name:       payload.clubName,
                name:            payload.name,
                phone:           payload.phone,
                comment:         payload.comment,
            });
        },
        [organization_id],
    );

    return (
        <>
        <section className="clubs-slider-widget wrapper__block">
            <div className="clubs-slider-widget__container">
                {title && show_title && (
                    <div className="block__header">
                        <h2 className="clubs-slider-widget__title">{title}</h2>
                    </div>
                )}

                {loading && (
                    <div className="clubs-slider-widget__placeholder">
                        <span className="clubs-slider-widget__placeholder-text">
                            Загрузка…
                        </span>
                    </div>
                )}

                {error && !loading && (
                    <div className="clubs-slider-widget__error">{error}</div>
                )}

                {!loading && !error && !hasData && (
                    <div className="clubs-slider-widget__placeholder">
                        <span className="clubs-slider-widget__placeholder-text">
                            Кружки и секции не настроены
                        </span>
                    </div>
                )}

                {!loading && !error && hasData && (
                    <>
                        <div className="clubs-slider-widget__slider">
                            <Swiper
                                modules={shouldShowArrows ? [Navigation] : []}
                                navigation={
                                    shouldShowArrows
                                        ? {
                                              prevEl:
                                                  navigationPrevRef.current,
                                              nextEl:
                                                  navigationNextRef.current,
                                          }
                                        : false
                                }
                                spaceBetween={24}
                                slidesPerView={1}
                                breakpoints={{
                                    768: { slidesPerView: 1 },
                                    1024: { slidesPerView: 2 },
                                }}
                                onSwiper={(swiper) => {
                                    swiperRef.current = swiper;
                                }}
                                onBeforeInit={(swiper) => {
                                    if (!shouldShowArrows) return;
                                    const prevEl =
                                        navigationPrevRef.current;
                                    const nextEl =
                                        navigationNextRef.current;
                                    if (!prevEl || !nextEl) return;
                                    const nav =
                                        swiper.params.navigation;
                                    if (nav && typeof nav !== 'boolean') {
                                        nav.prevEl = prevEl;
                                        nav.nextEl = nextEl;
                                    }
                                }}
                            >
                                {displayClubs.map((club) => (
                                    <SwiperSlide key={club.id}>
                                        <div className="h-full">
                                            {renderCard(club)}
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {shouldShowArrows && (
                                <>
                                    <button
                                        ref={navigationPrevRef}
                                        className="clubs-slider-widget__nav clubs-slider-widget__nav--prev"
                                        aria-label="Предыдущий"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <button
                                        ref={navigationNextRef}
                                        className="clubs-slider-widget__nav clubs-slider-widget__nav--next"
                                        aria-label="Следующий"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                        <a
                            href="#clubs-all"
                            className="clubs-slider-widget__all-link"
                        >
                            Все кружки и секции
                        </a>
                    </>
                )}
            </div>
        </section>

        {signUpClub && (
            <ClubSignUpModal
                open={signUpClub !== null}
                onOpenChange={(open) => !open && setSignUpClub(null)}
                club={{ id: signUpClub.id, name: signUpClub.name }}
                organizationId={organization_id}
                onSubmit={handleSignUpSubmit}
            />
        )}
    </>
    );
};

export default ClubsSliderWidget;
