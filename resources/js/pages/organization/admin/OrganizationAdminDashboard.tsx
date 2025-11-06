import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    DollarSign,
    Eye,
    Globe,
    Menu,
    Settings,
    Target,
    Users,
} from 'lucide-react';

interface Organization {
    id: number;
    name: string;
    slug: string;
    description: string;
    type: string;
    status: string;
    logo_url?: string;
    sites_count?: number;
}

interface Stats {
    totalPages: number;
    totalUsers: number;
    totalMenus: number;
    totalSliders: number;
    totalDonations: number;
    monthlyVisitors: number;
    monthlyRevenue: number;
}

interface Props {
    organization: Organization;
    stats: Stats;
}

export default function OrganizationAdminDashboard({
    organization,
    stats,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Админ панель',
            href: '/dashboard',
        },
        {
            title: 'Организации',
            href: '/dashboard/organizations',
        },
        {
            title: organization.name,
            href: `/dashboard/organization/${organization.id}/admin`,
        },
    ];

    const adminMenuItems = [
        {
            title: 'Консоль',
            description: 'Общая статистика и быстрые действия',
            href: `/dashboard/organization/${organization.id}/admin/console`,
            icon: BarChart3,
            color: 'bg-blue-500',
        },
        {
            title: 'Настройки',
            description: 'Основные настройки организации',
            href: `/dashboard/organization/${organization.id}/admin/settings`,
            icon: Settings,
            color: 'bg-green-500',
        },
        {
            title: 'Платежи',
            description: 'Управление платежами и YooKassa',
            href: `/dashboard/organization/${organization.id}/admin/payments`,
            icon: DollarSign,
            color: 'bg-yellow-500',
        },
        {
            title: 'Редактор главной',
            description: 'Настройка главной страницы',
            href: `/dashboard/organization/${organization.id}/admin/homepage`,
            icon: Eye,
            color: 'bg-purple-500',
        },
        {
            title: 'Telegram бот',
            description: 'Настройка Telegram бота',
            href: `/dashboard/organization/${organization.id}/admin/telegram`,
            icon: Globe,
            color: 'bg-cyan-500',
        },
        {
            title: 'Отчеты',
            description: 'Генерация отчетов',
            href: `/dashboard/organization/${organization.id}/admin/reports`,
            icon: BarChart3,
            color: 'bg-indigo-500',
        },
    ];

    const siteMenuItems = [
        {
            title: 'Сайты',
            description: 'Управление сайтами организации',
            href: `/dashboard/organization/${organization.id}/admin/sites`,
            icon: Globe,
            color: 'bg-emerald-500',
        },
        {
            title: 'Страницы',
            description: 'Управление страницами',
            href: `/dashboard/organization/${organization.id}/admin/pages`,
            icon: Menu,
            color: 'bg-orange-500',
        },
        {
            title: 'Меню',
            description: 'Управление навигацией',
            href: `/dashboard/organization/${organization.id}/admin/menus`,
            icon: Menu,
            color: 'bg-pink-500',
        },
        {
            title: 'Слайдеры',
            description: 'Управление слайдерами',
            href: `/dashboard/organization/${organization.id}/admin/sliders`,
            icon: Eye,
            color: 'bg-teal-500',
        },
        {
            title: 'Проекты',
            description: 'Управление проектами организации',
            href: `/dashboard/organization/${organization.id}/admin/projects`,
            icon: Target,
            color: 'bg-amber-500',
        },
    ];

    const userMenuItems = [
        {
            title: 'Пользователи',
            description: 'Управление пользователями',
            href: `/dashboard/organization/${organization.id}/admin/users`,
            icon: Users,
            color: 'bg-slate-500',
        },
        {
            title: 'Галерея',
            description: 'Управление медиафайлами',
            href: `/dashboard/organization/${organization.id}/admin/gallery`,
            icon: Eye,
            color: 'bg-rose-500',
        },
        {
            title: 'Аналитика',
            description: 'Статистика и аналитика',
            href: `/dashboard/organization/${organization.id}/admin/analytics`,
            icon: BarChart3,
            color: 'bg-violet-500',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Админ-панель - ${organization.name}`} />

            <div className="ml-6 mr-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {organization.logo_url && (
                            <img
                                src={organization.logo_url}
                                alt={organization.name}
                                className="h-16 w-16 rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">
                                {organization.name}
                            </h1>
                            <p className="text-muted-foreground">
                                Админ-панель организации
                            </p>
                            <div className="mt-2 flex items-center space-x-2">
                                <Badge variant="secondary">
                                    {organization.type}
                                </Badge>
                                <Badge
                                    variant={
                                        organization.status === 'active'
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {organization.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Страницы
                            </CardTitle>
                            <Menu className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalPages}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Пользователи
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalUsers}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Пожертвования
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalDonations}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.monthlyRevenue}₽ за месяц
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Посетители
                            </CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.monthlyVisitors}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                за этот месяц
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Администрирование */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            Администрирование
                        </h2>
                        <div className="grid gap-3">
                            {adminMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.title} href={item.href}>
                                        <Card className="cursor-pointer transition-shadow hover:shadow-md">
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={`rounded-lg p-2 ${item.color}`}
                                                    >
                                                        <Icon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Сайты и контент */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            Сайты и контент
                        </h2>
                        <div className="grid gap-3">
                            {siteMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.title} href={item.href}>
                                        <Card className="cursor-pointer transition-shadow hover:shadow-md">
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={`rounded-lg p-2 ${item.color}`}
                                                    >
                                                        <Icon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Пользователи и аналитика */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            Пользователи и аналитика
                        </h2>
                        <div className="grid gap-3">
                            {userMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.title} href={item.href}>
                                        <Card className="cursor-pointer transition-shadow hover:shadow-md">
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={`rounded-lg p-2 ${item.color}`}
                                                    >
                                                        <Icon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
