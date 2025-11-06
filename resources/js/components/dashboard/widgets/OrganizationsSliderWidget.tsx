import OrganizationCard from '@/components/organizations/OrganizationCard';
import { fetchPublicOrganizations } from '@/lib/api/public';
import { Link } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

interface Organization {
    id: number;
    name: string;
    slug?: string;
    address?: string;
    city?: { id: number; name: string };
    image?: string;
    logo?: string;
    donations_total?: number;
    donations_collected?: number;
    members_count?: number;
    sponsors_count?: number;
    projects_count?: number;
    director?: { name: string };
    director_name?: string | null;
}

interface OrganizationsSliderConfig {
    title?: string;
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
        city_id,
        limit = 9,
        slidesPerView = 3,
        showHeaderActions = true,
    } = config;

    const [items, setItems] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigationNextClass = useMemo(
        () => `orgs-slider-next-${Math.random().toString(36).slice(2, 8)}`,
        [],
    );
    const navigationPrevClass = useMemo(
        () => `orgs-slider-prev-${Math.random().toString(36).slice(2, 8)}`,
        [],
    );
    const swiperRef = useRef<any>(null);

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
            } catch (e: any) {
                if (e?.name !== 'AbortError')
                    setError(e?.message || 'Не удалось загрузить организации');
            } finally {
                setLoading(false);
            }
        };
        run();
        return () => controller.abort();
    }, [city_id, limit]);

    return (
        <section className="py-8">
            <div className="container mx-auto px-4">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {title}
                    </h2>
                    {showHeaderActions && (
                        <Link
                            href="/organizations"
                            className="btn-outline-primary dark-color"
                        >
                            Все школы
                        </Link>
                    )}
                </div>

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
                    <div className="relative">
                        {/* Arrows */}
                        <div className={`${navigationPrevClass}`}></div>
                        <div className={`${navigationNextClass}`}></div>

                        {/* Arrow styles */}
                        <style
                            dangerouslySetInnerHTML={{
                                __html: `
                                .${navigationNextClass}, .${navigationPrevClass} {
                                    color: #333; background: #fff; width: 40px; height: 40px; border-radius: 50%;
                                    position: absolute; top: 50%; transform: translateY(-50%);
                                    display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                                    cursor: pointer; z-index: 10;
                                }
                                .${navigationPrevClass} { left: -10px; }
                                .${navigationNextClass} { right: -10px; }
                                .${navigationNextClass}:after { content: '›'; font-size: 18px; font-weight: 600; }
                                .${navigationPrevClass}:after { content: '‹'; font-size: 18px; font-weight: 600; }
                                @media (max-width: 640px) {
                                    .${navigationPrevClass} { left: 4px; }
                                    .${navigationNextClass} { right: 4px; }
                                }
                            `,
                            }}
                        />

                        <Swiper
                            modules={[Navigation]}
                            navigation={{
                                nextEl: `.${navigationNextClass}`,
                                prevEl: `.${navigationPrevClass}`,
                            }}
                            spaceBetween={16}
                            slidesPerView={1}
                            breakpoints={{
                                640: {
                                    slidesPerView: Math.min(2, slidesPerView),
                                },
                                1024: { slidesPerView },
                            }}
                            onBeforeInit={(swiper) => {
                                swiperRef.current = swiper;
                            }}
                        >
                            {items.map((organization) => (
                                <SwiperSlide key={organization.id}>
                                    <div className="h-full">
                                        <OrganizationCard
                                            organization={organization as any}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}
            </div>
        </section>
    );
};

export default OrganizationsSliderWidget;
