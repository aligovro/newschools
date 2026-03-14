import OrganizationContactCard from '@/components/dashboard/pages/organizations/OrganizationContactCard';
import OrganizationDirectorCard from '@/components/dashboard/pages/organizations/OrganizationDirectorCard';
import OrganizationInfoCard from '@/components/dashboard/pages/organizations/OrganizationInfoCard';
import { StatusBadge } from '@/components/dashboard/pages/organizations/StatusBadge';
import type { OrganizationShow } from '@/components/dashboard/pages/organizations/types';
import {
    getTypeLabel,
    useOrganizationTerms,
} from '@/components/dashboard/pages/organizations/utils';
import YooKassaOAuthBlock from '@/components/dashboard/pages/organizations/YooKassaOAuthBlock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    BookOpen,
    CreditCard,
    DollarSign,
    Edit,
    Eye,
    FileText,
    Globe,
    Plus,
    Repeat,
    Settings,
    Target,
    Users,
    Video,
} from 'lucide-react';

type StatsCardAction = { label: string; href: string };
type StatsCard = {
    title: string;
    value: number;
    icon: LucideIcon;
    helperText: string;
    action?: StatsCardAction;
};

interface Props {
    organization: OrganizationShow;
    stats: {
        totalSites: number;
        totalSitePages: number;
        totalUsers: number;
        totalDonations: number;
        totalProjects: number;
        monthlyVisitors: number;
        monthlyRevenue: number;
        monthlyRevenueFormatted?: string | null;
    };
}

export default function OrganizationShowPage({ organization, stats }: Props) {
    const {
        pluralNominative: organizationPluralNominative,
        singularGenitive: organizationSingularGenitive,
    } = useOrganizationTerms();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Админ панель', href: dashboard().url },
        { title: organizationPluralNominative, href: '/dashboard/organizations' },
        { title: 'Просмотр', href: '#' },
    ];

    const statsCards: StatsCard[] = [
        {
            title: 'Сайты',
            value: stats.totalSites,
            icon: Globe,
            helperText: `Всего сайтов ${organizationSingularGenitive}`,
        },
        {
            title: 'Страницы',
            value: stats.totalSitePages,
            icon: FileText,
            helperText: 'Страниц во всех сайтах',
        },
        {
            title: 'Пользователи',
            value: stats.totalUsers,
            icon: Users,
            helperText: `Команда ${organizationSingularGenitive}`,
        },
        {
            title: 'Посетители',
            value: stats.monthlyVisitors,
            icon: Eye,
            helperText: 'За текущий месяц',
        },
        {
            title: 'Пожертвования',
            value: stats.totalDonations,
            icon: CreditCard,
            helperText: stats.monthlyRevenueFormatted
                ? `+${stats.monthlyRevenueFormatted} ₽ за месяц`
                : 'Данные за текущий месяц',
        },
        {
            title: 'Проекты',
            value: stats.totalProjects,
            icon: Target,
            helperText: 'Активных проектов',
            action: {
                label: 'Добавить проект',
                href: `/dashboard/organizations/${organization.id}/projects/create`,
            },
        },
    ];

    const adminMenuItems = [
        {
            title: 'Консоль',
            description: 'Общая статистика и быстрые действия',
            href: `/dashboard/organizations/${organization.id}/console`,
            icon: BarChart3,
            color: 'bg-blue-500',
        },
        {
            title: 'Настройки',
            description: `Основные настройки ${organizationSingularGenitive}`,
            href: `/dashboard/organizations/${organization.id}/settings`,
            icon: Settings,
            color: 'bg-green-500',
        },
        {
            title: 'Платежи',
            description: 'Управление платежами и YooKassa',
            href: `/dashboard/organizations/${organization.id}/payments`,
            icon: DollarSign,
            color: 'bg-yellow-500',
        },
        {
            title: 'Автоплатежи',
            description: 'Регулярные подписки и автоплатежи',
            href: `/dashboard/organizations/${organization.id}/payments?tab=autopayments`,
            icon: Repeat,
            color: 'bg-amber-500',
        },
        {
            title: 'Telegram бот',
            description: 'Настройка Telegram бота',
            href: `/dashboard/organizations/${organization.id}/telegram`,
            icon: Globe,
            color: 'bg-cyan-500',
        },
        {
            title: 'Отчеты',
            description: 'Генерация отчетов',
            href: `/dashboard/organizations/${organization.id}/reports`,
            icon: BarChart3,
            color: 'bg-indigo-500',
        },
    ];

    const contentMenuItems = [
        {
            title: 'Сайты',
            description: `Управление сайтами ${organizationSingularGenitive}`,
            href: `/dashboard/organizations/${organization.id}/sites`,
            icon: Globe,
            color: 'bg-emerald-500',
        },
        {
            title: 'Проекты',
            description: `Управление проектами ${organizationSingularGenitive}`,
            href: `/dashboard/organizations/${organization.id}/projects`,
            icon: Target,
            color: 'bg-amber-500',
        },
        {
            title: 'Аналитика',
            description: 'Статистика и аналитика',
            href: `/dashboard/organizations/${organization.id}/analytics`,
            icon: BarChart3,
            color: 'bg-violet-500',
        },
    ];

    const entityCards = [
        {
            title: 'Персонал',
            count: organization.staff_count ?? 0,
            icon: Users,
            color: 'bg-slate-500',
            href: `/dashboard/organizations/${organization.id}/staff`,
            addHref: `/dashboard/organizations/${organization.id}/staff`,
            label: (n: number) => `${n} сотрудник${n === 1 ? '' : n >= 2 && n <= 4 ? 'а' : 'ов'}`,
        },
        {
            title: 'Кружки и секции',
            count: organization.clubs_count ?? 0,
            icon: BookOpen,
            color: 'bg-rose-500',
            href: `/dashboard/organizations/${organization.id}/clubs`,
            addHref: `/dashboard/organizations/${organization.id}/clubs`,
            label: (n: number) => `${n} кружок${n === 1 ? '' : n >= 2 && n <= 4 ? 'а' : 'ов'}`,
        },
        {
            title: 'Видео уроки',
            count: organization.video_lessons_count ?? 0,
            icon: Video,
            color: 'bg-purple-500',
            href: `/dashboard/organizations/${organization.id}/video-lessons`,
            addHref: `/dashboard/organizations/${organization.id}/video-lessons`,
            label: (n: number) => `${n} урок${n === 1 ? '' : n >= 2 && n <= 4 ? 'а' : 'ов'}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={organization.name} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/organizations">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад к списку
                            </Button>
                        </Link>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="block__title">{organization.name}</h1>
                                <StatusBadge status={organization.status} />
                            </div>
                            <p className="text-gray-600">
                                {getTypeLabel(organization.type)}
                                {organization.region?.name && ` • ${organization.region.name}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {organization.primary_site ||
                        (organization.sites && organization.sites.length > 0) ? (
                            <Link
                                href={`/dashboard/organizations/${organization.id}/sites/${
                                    organization.primary_site?.id || organization.sites?.[0]?.id
                                }/builder`}
                            >
                                <Button variant="default" size="sm">
                                    <Globe className="mr-2 h-4 w-4" />
                                    Конструктор сайта
                                </Button>
                            </Link>
                        ) : (
                            <Link href={`/dashboard/organizations/${organization.id}/sites/create`}>
                                <Button variant="default" size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Создать сайт
                                </Button>
                            </Link>
                        )}
                        <Link href={`/dashboard/organizations/${organization.id}/reports`}>
                            <Button variant="outline" size="sm">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Отчеты
                            </Button>
                        </Link>
                        <Link href={`/dashboard/organizations/${organization.id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Основная информация */}
                    <div className="space-y-6 lg:col-span-2">
                        <OrganizationInfoCard organization={organization} />

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {statsCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <Card key={card.title}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                {card.title}
                                            </CardTitle>
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="text-2xl font-bold">{card.value}</div>
                                            <p className="text-xs text-muted-foreground">
                                                {card.helperText}
                                            </p>
                                            {card.action && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full justify-center"
                                                    asChild
                                                >
                                                    <Link href={card.action.href}>
                                                        {card.action.label}
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Admin menu */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {adminMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.title} href={item.href} className="block">
                                        <Card className="transition-colors hover:bg-muted/50">
                                            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                                                <div className={`rounded-lg p-2 ${item.color}`}>
                                                    <Icon className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <CardTitle className="text-base">
                                                        {item.title}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Content menu */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {contentMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.title} href={item.href} className="block">
                                        <Card className="transition-colors hover:bg-muted/50">
                                            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                                                <div className={`rounded-lg p-2 ${item.color}`}>
                                                    <Icon className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <CardTitle className="text-base">
                                                        {item.title}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Правая колонка */}
                    <div className="space-y-6">
                        <OrganizationContactCard organization={organization} />

                        <YooKassaOAuthBlock organizationId={organization.id} />

                        {organization.director && organization.director.id && (
                            <OrganizationDirectorCard
                                director={organization.director}
                                onEdit={() =>
                                    router.visit(`/dashboard/organizations/${organization.id}/staff`)
                                }
                            />
                        )}

                        {/* Сущности организации — компактные карточки-ссылки */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                    Контент
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 pt-0">
                                {entityCards.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-muted/60"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`rounded p-1.5 ${item.color}`}>
                                                    <Icon className="h-3.5 w-3.5 text-white" />
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {item.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {item.label(item.count)}
                                                </span>
                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
