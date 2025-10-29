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
        terminology?: {
            dashboard_title: string;
            total_organizations: string;
            total_members: string;
            recent_organizations: string;
            recent_members: string;
            create_organization: string;
            manage_organizations: string;
            global_settings: string;
            global_settings_description: string;
        };
        favicon?: string;
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

    // Получаем терминологию из props
    const terminology = props.terminology || {
        dashboard_title: 'Админ-панель',
        total_organizations: 'Всего организаций',
        total_members: 'Всего участников',
        recent_organizations: 'Последние организации',
        recent_members: 'Последние участники',
        create_organization: 'Создать организацию',
        manage_organizations: 'Управление организациями',
        global_settings: 'Глобальные настройки',
        global_settings_description:
            'Управление терминологией и настройками системы',
    };

    return {
        stats,
        terminology,
        favicon: props.favicon,
        isLoading: false, // Данные уже загружены на сервере
        error: null,
        refreshStats: () => {
            // Для обновления данных используем Inertia.reload()
            window.location.reload();
        },
    };
};
