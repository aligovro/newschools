import { usePage } from '@inertiajs/react';

export interface DashboardStats {
    totalUsers: number;
    totalOrganizations: number;
    totalSites: number;
    totalDonations: number;
    userGrowth: number;
    donationGrowth: number;
    siteGrowth: number;
    organizationGrowth: number;
    recentUsers: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
    }>;
    recentOrganizations: Array<{
        id: number;
        name: string;
        type: string;
        status: string;
        created_at: string;
    }>;
}

export const useDashboardStats = () => {
    const { props } = usePage<{
        auth?: { user?: { id: number } };
        stats?: DashboardStats;
    }>();

    // Получаем статистику из props (передается с сервера)
    const stats = props.stats || {
        totalUsers: 0,
        totalOrganizations: 0,
        totalSites: 0,
        totalDonations: 0,
        userGrowth: 0,
        donationGrowth: 0,
        siteGrowth: 0,
        organizationGrowth: 0,
        recentUsers: [],
        recentOrganizations: [],
    };

    return {
        stats,
        isLoading: false, // Данные уже загружены на сервере
        error: null,
        refreshStats: () => {
            // Для обновления данных используем Inertia.reload()
            window.location.reload();
        },
    };
};
