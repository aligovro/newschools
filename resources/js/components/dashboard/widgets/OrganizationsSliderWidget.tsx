import OrganizationCard from '@/components/organizations/OrganizationCard';
import { fetchPublicOrganizations } from '@/lib/api/public';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import '@css/widgets/organizations-slider-widget.scss';
import 'swiper/css';
import 'swiper/css/navigation';

type Organization = React.ComponentProps<
    typeof OrganizationCard
>['organization'];

interface OrganizationsSliderConfig {
    title?: string;
    show_title?: boolean; // Показывать заголовок на сайте
    city_id?: number;
    limit?: number;
    slidesPerView?: number; // desktop
    showHeaderActions?: boolean;
}

interface Props {
    config?: OrganizationsSliderConfig;
}

export const OrganizationsSliderWidget: React.FC<Props> = ({ config = {} }) => {
    const {
        title = 'Школы города',
        show_title = true, // По умолчанию true для обратной совместимости
        city_id,
        limit = 9,
        slidesPerView = 3,
        showHeaderActions = true,
    } = config;

    const [items, setItems] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const swiperRef = useRef<SwiperType | null>(null);
    const navigationPrevRef = useRef<HTMLButtonElement>(null);
    const navigationNextRef = useRef<HTMLButtonElement>(null);

    // Показываем стрелки только если элементов больше, чем видимых слайдов
    const shouldShowArrows = useMemo(
        () => items.length > slidesPerView,
        [items.length, slidesPerView],
    );

    useEffect(() => {
        const controller = new AbortController();
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchPublicOrganizations({
                    city_id,
                    limit,
                    order_by: 'donations_collected',
                    order_direction: 'desc',
                });
                const list: Organization[] = Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data)
                      ? data
                      : [];
                setItems(list);
            } catch (error) {
                if ((error as { name?: string })?.name === 'AbortError') {
                    return;
                }
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить организации';
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        run();
        return () => controller.abort();
    }, [city_id, limit]);

    useEffect(() => {
        const swiper = swiperRef.current;
        const prevEl = navigationPrevRef.current;
        const nextEl = navigationNextRef.current;

        if (!swiper || !shouldShowArrows || !prevEl || !nextEl) return;

        // Обновляем элементы навигации только когда они доступны
        const navigation = swiper.params.navigation;
        if (navigation && typeof navigation !== 'boolean') {
            navigation.prevEl = prevEl;
            navigation.nextEl = nextEl;
        }

        const navigationModule = swiper.navigation;
        navigationModule?.destroy();
        navigationModule?.init();
        navigationModule?.update();
    }, [shouldShowArrows, items.length]);

    return (
        <section className="py-8">
            <div className="container mx-auto">
                {(title && show_title) || showHeaderActions ? (
                    <div className="mb-6 flex items-center justify-between">
                        {title && show_title && (
                            <h2 className="text-2xl font-bold text-gray-900">
                                {title}
                            </h2>
                        )}
                        {showHeaderActions && (
                            <Link
                                href="/organizations"
                                className="btn-outline-primary dark-color"
                            >
                                Все школы
                            </Link>
                        )}
                    </div>
                ) : null}

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
                {!loading && !error && items.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <span className="text-gray-500">Нет организаций</span>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="organizations-slider-widget relative">
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
                                640: {
                                    slidesPerView: Math.min(2, slidesPerView),
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

                                const navigation = swiper.params.navigation;
                                if (
                                    navigation &&
                                    typeof navigation !== 'boolean'
                                ) {
                                    navigation.prevEl = prevEl;
                                    navigation.nextEl = nextEl;
                                }
                            }}
                        >
                            {items.map((organization) => (
                                <SwiperSlide key={organization.id}>
                                    <div className="h-full">
                                        <OrganizationCard
                                            organization={organization}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {shouldShowArrows && (
                            <>
                                <button
                                    ref={navigationPrevRef}
                                    className="organizations-slider-widget__navigation organizations-slider-widget__navigation--prev"
                                    aria-label="Previous slide"
                                >
                                    <ArrowLeft />
                                </button>
                                <button
                                    ref={navigationNextRef}
                                    className="organizations-slider-widget__navigation organizations-slider-widget__navigation--next"
                                    aria-label="Next slide"
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

export default OrganizationsSliderWidget;
