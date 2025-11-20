import LoadMoreButton from '@/components/main-site/LoadMoreButton';
import OrganizationCard from '@/components/organizations/OrganizationCard';
import type { MoneyAmount } from '@/types/money';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface OrganizationData {
    id: number;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    logo?: string;
    image?: string;
    region?: { name: string };
    locality?: { id: number; name: string };
    type: string;
    projects_count: number;
    members_count?: number;
    sponsors_count?: number;
    donations_total: number;
    donations_collected: number;
    director_name?: string;
    needs?: {
        target: MoneyAmount;
        collected: MoneyAmount;
        progress_percentage: number;
    } | null;
    latitude?: number | null;
    longitude?: number | null;
}

interface ListTabProps {
    organizations: {
        data: OrganizationData[];
        current_page: number;
        last_page: number;
        per_page?: number;
        total?: number;
        meta?: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    filters?: {
        search?: string;
        region_id?: number;
        locality_id?: number;
    };
    getPaginationUrl: (page: number) => string;
}

export default function ListTab({
    organizations,
    getPaginationUrl,
    filters,
}: ListTabProps) {
    const meta = organizations.meta ?? {
        current_page: organizations.current_page ?? 1,
        last_page: organizations.last_page ?? 1,
        per_page: organizations.per_page ?? organizations.data.length,
        total: organizations.total ?? organizations.data.length,
    };

    const [items, setItems] = useState<OrganizationData[]>(organizations.data);
    const [currentPage, setCurrentPage] = useState(meta.current_page);
    const [lastPage, setLastPage] = useState(meta.last_page);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setItems(organizations.data);
        setCurrentPage(
            organizations.meta?.current_page ?? organizations.current_page ?? 1,
        );
        setLastPage(
            organizations.meta?.last_page ?? organizations.last_page ?? 1,
        );
    }, [
        organizations.data,
        organizations.current_page,
        organizations.last_page,
        organizations.meta?.current_page,
        organizations.meta?.last_page,
        filters?.search,
        filters?.region_id,
        filters?.locality_id,
    ]);

    const hasMore = useMemo(
        () => currentPage < lastPage,
        [currentPage, lastPage],
    );

    const handleLoadMore = useCallback(async () => {
        if (!hasMore || isLoading) return;
        const nextPage = currentPage + 1;

        try {
            setIsLoading(true);
            const response = await fetch(getPaginationUrl(nextPage), {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to load organizations (status ${response.status})`,
                );
            }

            const payload = await response.json();
            const nextItems: OrganizationData[] = Array.isArray(payload?.data)
                ? payload.data
                : [];
            const meta = payload?.meta ?? {};

            if (nextItems.length > 0) {
                setItems((prev) => [...prev, ...nextItems]);
            }

            if (typeof meta.current_page === 'number') {
                setCurrentPage(meta.current_page);
            } else {
                setCurrentPage(nextPage);
            }

            if (typeof meta.last_page === 'number') {
                setLastPage(meta.last_page);
            }
        } catch (error) {
            console.error('Ошибка при загрузке организаций:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, getPaginationUrl, hasMore, isLoading]);

    return (
        <>
            {items.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((organization) => (
                        <OrganizationCard
                            key={organization.id}
                            organization={organization}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center">
                    <p className="text-gray-500">Организации не найдены</p>
                </div>
            )}

            <div className="mt-8 flex justify-center">
                <LoadMoreButton
                    onClick={handleLoadMore}
                    isLoading={isLoading}
                    hasMore={hasMore}
                />
            </div>
        </>
    );
}
