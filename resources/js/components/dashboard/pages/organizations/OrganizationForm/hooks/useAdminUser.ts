import { useMemo, useState, useEffect } from 'react';
import { useGeoSelectData } from '@/hooks/useGeoSelectData';
import type { SelectOption } from '@/components/ui/universal-select/UniversalSelect';
import type { OrganizationLite } from '../../types';

interface UseAdminUserProps {
    organization?: OrganizationLite;
}

interface UseAdminUserReturn {
    adminUserId: number | null;
    setAdminUserId: (id: number | null) => void;
    usersOptions: SelectOption[];
    loading: boolean;
    hasMore: boolean;
    loadingMore: boolean;
    search: string;
    setSearch: (query: string) => void;
    loadMore: () => void;
}

export function useAdminUser({
    organization,
}: UseAdminUserProps): UseAdminUserReturn {
    const adminUserFromProps = (organization as any)?.admin_user;
    const adminUserIdFromProps = adminUserFromProps?.id ?? null;

    const [adminUserId, setAdminUserId] = useState<number | null>(
        adminUserIdFromProps,
    );

    // Синхронизация с пропсами
    useEffect(() => {
        if (adminUserIdFromProps !== adminUserId) {
            setAdminUserId(adminUserIdFromProps);
        }
    }, [adminUserIdFromProps, adminUserId]);

    // Опция для админа
    const adminUserOption = useMemo(() => {
        if (
            adminUserFromProps &&
            adminUserFromProps.id &&
            adminUserFromProps.name
        ) {
            return {
                value: adminUserFromProps.id,
                label: adminUserFromProps.name,
                description: adminUserFromProps.email || '',
            };
        }
        return null;
    }, [adminUserFromProps]);

    // Данные пользователей
    const usersData = useGeoSelectData({
        endpoint: '/dashboard/api/users',
        transformResponse: (data: unknown[]) => {
            return data.map((item: any) => ({
                value: item.id,
                label: item.name,
                description: item.email,
            }));
        },
    });

    // Объединенные опции с админом в начале
    const usersOptions = useMemo(() => {
        const allOptions = [...usersData.options];

        if (adminUserOption) {
            const adminIndex = allOptions.findIndex(
                (opt) => opt.value === adminUserOption.value,
            );

            if (adminIndex === -1) {
                return [adminUserOption, ...allOptions];
            } else if (adminIndex > 0) {
                const updatedOptions = [...allOptions];
                updatedOptions.splice(adminIndex, 1);
                return [adminUserOption, ...updatedOptions];
            }
        }

        return allOptions;
    }, [usersData.options, adminUserOption]);

    return {
        adminUserId,
        setAdminUserId,
        usersOptions,
        loading: usersData.loading,
        hasMore: usersData.hasMore,
        loadingMore: usersData.loadingMore,
        search: usersData.search,
        setSearch: usersData.setSearch,
        loadMore: usersData.loadMore,
    };
}

