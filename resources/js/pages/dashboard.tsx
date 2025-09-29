import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Building2,
    DollarSign,
    Globe,
    Plus,
    RefreshCw,
    Settings,
    TrendingUp,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Данные будут загружаться через хук useDashboardStats

const quickActions = [
    {
        title: 'Создать пользователя',
        description: 'Добавить нового пользователя в систему',
        href: '/dashboard/users',
        icon: Users,
        color: 'bg-blue-500',
    },
    {
        title: 'Создать организацию',
        description: 'Зарегистрировать новую организацию',
        href: '/dashboard/organizations/create',
        icon: Building2,
        color: 'bg-green-500',
    },
    {
        title: 'Создать сайт',
        description: 'Создать новый сайт для организации',
        href: '/dashboard/sites/create',
        icon: Globe,
        color: 'bg-purple-500',
    },
    {
        title: 'Настройки системы',
        description: 'Управление настройками приложения',
        href: '/dashboard/settings',
        icon: Settings,
        color: 'bg-gray-500',
    },
];

export default function Dashboard() {
    const { stats, isLoading, error, refreshStats } = useDashboardStats();

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Админ-панель" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    <div className="flex min-h-64 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Загрузка данных...
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Админ-панель" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    <div className="flex min-h-64 items-center justify-center">
                        <div className="text-center">
                            <div className="mb-2 text-lg font-medium text-red-500">
                                Ошибка загрузки данных
                            </div>
                            <div className="mb-4 text-gray-600">{error}</div>
                            <Button
                                onClick={refreshStats}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Попробовать снова
                            </Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Админ-панель" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Заголовок */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Админ-панель
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Обзор системы и управление
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshStats}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Обновить
                        </Button>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Activity className="h-4 w-4" />
                            Система работает
                        </Badge>
                    </div>
                </div>

                {/* Статистические карточки */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Пользователи
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.totalUsers.toLocaleString() || 0}
                            </div>
                            <p className="flex items-center text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                +{stats?.userGrowth || 0}% за месяц
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Организации
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.totalOrganizations || 0}
                            </div>
                            <p className="flex items-center text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                +{stats?.organizationGrowth || 0}% за месяц
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Сайты
                            </CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.totalSites || 0}
                            </div>
                            <p className="flex items-center text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                +{stats?.siteGrowth || 0}% за месяц
                            </p>
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
                                ₽{stats?.totalDonations.toLocaleString() || 0}
                            </div>
                            <p className="flex items-center text-xs text-muted-foreground">
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                +{stats?.donationGrowth || 0}% за месяц
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Основной контент */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Быстрые действия */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Быстрые действия
                            </CardTitle>
                            <CardDescription>
                                Часто используемые функции
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {quickActions.map((action, index) => (
                                <Link key={index} href={action.href}>
                                    <div className="flex items-center space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                                        >
                                            <action.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {action.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {action.description}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Последние пользователи */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Последние пользователи
                            </CardTitle>
                            <CardDescription>
                                Недавно зарегистрированные пользователи
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats?.recentUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center space-x-4"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {user.role}
                                            </Badge>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {user.created_at}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <Link href="/users">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            Посмотреть всех пользователей
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Последние организации */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Последние организации
                        </CardTitle>
                        <CardDescription>
                            Недавно зарегистрированные организации
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentOrganizations.map((org) => (
                                <div
                                    key={org.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {org.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Тип: {org.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Badge
                                            variant={
                                                org.status === 'active'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="text-xs"
                                        >
                                            {org.status === 'active'
                                                ? 'Активна'
                                                : 'На рассмотрении'}
                                        </Badge>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {org.created_at}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
