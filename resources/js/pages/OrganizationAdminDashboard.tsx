import { Button } from '@/components/common/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/common/ui/card';
import OrganizationAdminLayout from '@/layouts/OrganizationAdminLayout';
import { CreditCard, FileText, Menu, Settings, Users } from 'lucide-react';

interface Organization {
    id: number;
    name: string;
    slug: string;
    domain?: string;
}

interface Stats {
    totalPages: number;
    totalUsers: number;
    totalMenus: number;
    totalDonations: number;
    monthlyVisitors: number;
    monthlyRevenue: number;
}

interface OrganizationAdminDashboardProps {
    organization: Organization;
    stats: Stats;
}

export default function OrganizationAdminDashboard({
    organization,
    stats,
}: OrganizationAdminDashboardProps) {
    const quickActions = [
        {
            title: 'Управление меню',
            description: 'Настройте навигацию сайта',
            href: route('organization.admin.menus', organization.slug),
            icon: Menu,
            color: 'bg-blue-500',
        },
        {
            title: 'Создать страницу',
            description: 'Добавьте новую страницу',
            href: route('organization.admin.pages.create', organization.slug),
            icon: FileText,
            color: 'bg-green-500',
        },
        {
            title: 'Управление пользователями',
            description: 'Добавьте администраторов',
            href: route('organization.admin.users', organization.slug),
            icon: Users,
            color: 'bg-purple-500',
        },
        {
            title: 'Настройки сайта',
            description: 'Конфигурация и SEO',
            href: route('organization.admin.settings', organization.slug),
            icon: Settings,
            color: 'bg-orange-500',
        },
    ];

    const statsCards = [
        {
            title: 'Страницы',
            value: stats.totalPages,
            icon: FileText,
            change: '+12%',
            changeType: 'positive' as const,
        },
        {
            title: 'Пользователи',
            value: stats.totalUsers,
            icon: Users,
            change: '+8%',
            changeType: 'positive' as const,
        },
        {
            title: 'Меню',
            value: stats.totalMenus,
            icon: Menu,
            change: '+2',
            changeType: 'neutral' as const,
        },
        {
            title: 'Пожертвования',
            value: stats.totalDonations,
            icon: CreditCard,
            change: '+15%',
            changeType: 'positive' as const,
        },
    ];

    return (
        <OrganizationAdminLayout
            organization={organization}
            title="Панель управления"
        >
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Добро пожаловать в админку
                    </h1>
                    <p className="text-muted-foreground">
                        Управляйте сайтом организации "{organization.name}"
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stat.value}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        <span
                                            className={
                                                stat.changeType === 'positive'
                                                    ? 'text-green-600'
                                                    : stat.changeType ===
                                                        'negative'
                                                      ? 'text-red-600'
                                                      : 'text-gray-600'
                                            }
                                        >
                                            {stat.change}
                                        </span>{' '}
                                        с прошлого месяца
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="mb-4 text-2xl font-bold tracking-tight">
                        Быстрые действия
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Card
                                    key={action.title}
                                    className="transition-shadow hover:shadow-md"
                                >
                                    <CardHeader>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className={`rounded-lg p-2 ${action.color}`}
                                            >
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <CardTitle className="text-lg">
                                                {action.title}
                                            </CardTitle>
                                        </div>
                                        <CardDescription>
                                            {action.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button asChild className="w-full">
                                            <a href={action.href}>Перейти</a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="mb-4 text-2xl font-bold tracking-tight">
                        Последняя активность
                    </h2>
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            Создана новая страница "О нас"
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            2 часа назад
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            Обновлено главное меню
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            5 часов назад
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            Добавлен новый пользователь
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            1 день назад
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </OrganizationAdminLayout>
    );
}
