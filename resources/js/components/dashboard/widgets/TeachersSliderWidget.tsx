import { fetchOrganizationStaff } from '@/lib/api/public';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

interface StaffMember {
    id: number;
    full_name: string;
    position?: string | null;
    photo?: string | null;
}

interface TeachersSliderConfig {
    title?: string;
    show_title?: boolean;
    organization_id?: number;
    limit?: number;
    slidesPerView?: number;
    staff?: StaffMember[];
}

interface Props {
    config?: TeachersSliderConfig;
}

export const TeachersSliderWidget: React.FC<Props> = ({ config = {} }) => {
    const {
        title = 'Преподаватели',
        show_title = true,
        organization_id,
        limit = 12,
        slidesPerView = 4,
        staff: providedStaff = [],
    } = config;

    const [items, setItems] = useState<StaffMember[]>(providedStaff);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const swiperRef = useRef<SwiperType | null>(null);
    const navigationPrevRef = useRef<HTMLButtonElement>(null);
    const navigationNextRef = useRef<HTMLButtonElement>(null);

    const hasData = providedStaff.length > 0 || items.length > 0;
    const displayItems = providedStaff.length > 0 ? providedStaff : items;

    const shouldShowArrows = useMemo(
        () => displayItems.length > slidesPerView,
        [displayItems.length, slidesPerView],
    );

    useEffect(() => {
        if (providedStaff.length > 0 || !organization_id || organization_id < 1) {
            if (providedStaff.length > 0) setItems(providedStaff);
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            try {
                setLoading(true);
                setError(null);

                const payload = await fetchOrganizationStaff(
                    { organization_id, limit: Math.min(limit, 50) },
                    { signal: controller.signal },
                );

                const staffList: StaffMember[] = Array.isArray(payload?.data)
                    ? payload.data.map((s: Record<string, unknown>) => ({
                          id: Number(s.id),
                          full_name: String(s.full_name ?? ''),
                          position: (s.position as string) ?? null,
                          photo: (s.photo as string) ?? null,
                      }))
                    : [];

                setItems(staffList);
            } catch (fetchError) {
                if ((fetchError as { name?: string })?.name === 'AbortError') {
                    return;
                }
                const message =
                    fetchError instanceof Error
                        ? fetchError.message
                        : 'Не удалось загрузить преподавателей';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        run();

        return () => controller.abort();
    }, [organization_id, limit, providedStaff.length]);

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
    }, [shouldShowArrows, displayItems.length]);

    const renderCard = (member: StaffMember) => {
        const photoUrl =
            member.photo &&
            !String(member.photo).startsWith('blob:') &&
            String(member.photo).trim()
                ? member.photo
                : null;

        return (
            <div className="teachers-slider-widget__card flex flex-col items-center rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
                <div className="teachers-slider-widget__avatar mb-3 h-24 w-24 overflow-hidden rounded-full bg-gray-200">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={member.full_name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <User size={40} strokeWidth={1.5} />
                        </div>
                    )}
                </div>
                <h3 className="mb-1 text-center font-semibold text-gray-900">
                    {member.full_name}
                </h3>
                {member.position && (
                    <p className="text-center text-sm text-gray-600">
                        {member.position}
                    </p>
                )}
            </div>
        );
    };

    return (
        <section className="teachers-slider-widget wrapper__block">
            <div className="container mx-auto">
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
                            Преподаватели не настроены
                        </span>
                    </div>
                )}

                {!loading && !error && displayItems.length > 0 && (
                    <div className="teachers-slider-widget__slider relative">
                        <Swiper
                            modules={shouldShowArrows ? [Navigation] : []}
                            navigation={
                                shouldShowArrows
                                    ? {
                                          prevEl: navigationPrevRef.current,
                                          nextEl: navigationNextRef.current,
                                      }
                                    : false
                            }
                            spaceBetween={16}
                            slidesPerView={1}
                            breakpoints={{
                                480: {
                                    slidesPerView: Math.min(2, slidesPerView),
                                },
                                768: {
                                    slidesPerView: Math.min(3, slidesPerView),
                                },
                                1024: { slidesPerView },
                            }}
                            onSwiper={(swiper) => {
                                swiperRef.current = swiper;
                            }}
                            onBeforeInit={(swiper) => {
                                if (!shouldShowArrows) return;
                                const prevEl = navigationPrevRef.current;
                                const nextEl = navigationNextRef.current;
                                if (!prevEl || !nextEl) return;

                                const nav = swiper.params.navigation;
                                if (nav && typeof nav !== 'boolean') {
                                    nav.prevEl = prevEl;
                                    nav.nextEl = nextEl;
                                }
                            }}
                        >
                            {displayItems.map((member) => (
                                <SwiperSlide key={member.id}>
                                    <div className="h-full">
                                        {renderCard(member)}
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {shouldShowArrows && (
                            <>
                                <button
                                    ref={navigationPrevRef}
                                    className="teachers-slider-widget__navigation teachers-slider-widget__navigation--prev"
                                    aria-label="Предыдущий"
                                >
                                    <ArrowLeft />
                                </button>
                                <button
                                    ref={navigationNextRef}
                                    className="teachers-slider-widget__navigation teachers-slider-widget__navigation--next"
                                    aria-label="Следующий"
                                >
                                    <ArrowRight />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TeachersSliderWidget;
