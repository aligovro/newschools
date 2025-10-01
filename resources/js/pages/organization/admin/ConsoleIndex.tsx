import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Bell,
    CreditCard,
    DollarSign,
    FileText,
    Plus,
    Settings,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import React from 'react';

interface Organization {
    id: number;
    name: string;
    description?: string;
    logo?: string;
}

interface Stats {
    totalDonations: number;
    monthlyDonations: number;
    totalMembers: number;
    newMembersThisMonth: number;
    activeProjects: number;
    totalProjects: number;
    pagesCount: number;
    lastLogin?: string;
}

interface RecentActivity {
    type: string;
    title: string;
    description: string;
    date: string;
    amount?: number;
}

interface QuickAction {
    title: string;
    description: string;
    icon: string;
    action: string;
    color: string;
}

interface Props {
    organization: Organization;
    stats: Stats;
    recentActivity: RecentActivity[];
    quickActions: QuickAction[];
}

export default function ConsoleIndex({
    organization,
    stats,
    recentActivity,
    quickActions,
}: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
        }).format(amount / 100);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getIcon = (iconName: string) => {
        const icons: {
            [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        } = {
            plus: Plus,
            'user-plus': UserPlus,
            'credit-card': CreditCard,
            'file-text': FileText,
        };
        return icons[iconName] || Activity;
    };

    return (
        <>
            <Head title={`Консоль - ${organization.name}`} />

            <div className="space-y-6">
                {/* Заголовок */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Консоль управления
                        </h1>
                        <p className="text-muted-foreground">
                            Добро пожаловать в панель управления организацией{' '}
                            {organization.name}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Настройки
                        </Button>
                        <Button variant="outline" size="sm">
                            <Bell className="mr-2 h-4 w-4" />
                            Уведомления
                        </Button>
                    </div>
                </div>

                {/* Статистика */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Общие пожертвования
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats.totalDonations)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                За все время
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                За этот месяц
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats.monthlyDonations)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.newMembersThisMonth} новых участников
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Участники
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalMembers}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.newMembersThisMonth} за месяц
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Активные проекты
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.activeProjects}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                из {stats.totalProjects} всего
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Недавняя активность */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Недавняя активность</CardTitle>
                            <CardDescription>
                                Последние действия в вашей организации
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-4"
                                        >
                                            <div className="flex-shrink-0">
                                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.title}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 text-sm text-gray-500">
                                                {formatDate(activity.date)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center">
                                        <Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <p className="text-gray-500">
                                            Пока нет активности
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Быстрые действия */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Быстрые действия</CardTitle>
                            <CardDescription>
                                Часто используемые функции
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {quickActions.map((action, index) => {
                                    const IconComponent = getIcon(action.icon);
                                    return (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="h-auto w-full justify-start p-4"
                                        >
                                            <IconComponent className="mr-3 h-4 w-4" />
                                            <div className="text-left">
                                                <div className="font-medium">
                                                    {action.title}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {action.description}
                                                </div>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Дополнительная информация */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Страницы сайта
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.pagesCount}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Создано страниц
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Последний вход
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">
                                {stats.lastLogin
                                    ? formatDate(stats.lastLogin)
                                    : 'Неизвестно'}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Активность пользователей
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Статус</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="default" className="bg-green-500">
                                Активна
                            </Badge>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Организация работает нормально
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
