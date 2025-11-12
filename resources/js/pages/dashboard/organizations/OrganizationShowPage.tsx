import OrganizationContactCard from '@/components/dashboard/pages/organizations/OrganizationContactCard';
import OrganizationDirectorCard from '@/components/dashboard/pages/organizations/OrganizationDirectorCard';
import OrganizationInfoCard from '@/components/dashboard/pages/organizations/OrganizationInfoCard';
import OrganizationStaffList from '@/components/dashboard/pages/organizations/OrganizationStaffList';
import OrganizationStaffModal from '@/components/dashboard/pages/organizations/OrganizationStaffModal';
import { StatusBadge } from '@/components/dashboard/pages/organizations/StatusBadge';
import type { OrganizationShow } from '@/components/dashboard/pages/organizations/types';
import {
    getTypeLabel,
    useOrganizationTerms,
} from '@/components/dashboard/pages/organizations/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganizationStaff } from '@/hooks/useOrganizationStaff';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BarChart3,
    CreditCard,
    DollarSign,
    Edit,
    Eye,
    FileText,
    Globe,
    Plus,
    Settings,
    Target,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type StatsCardAction = {
    label: string;
    href: string;
};

type StatsCard = {
    title: string;
    value: number;
    icon: LucideIcon;
    helperText: string;
    action?: StatsCardAction;
};
import { useState } from 'react';

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
        {
            title: 'Админ панель',
            href: dashboard().url,
        },
        {
            title: organizationPluralNominative,
            href: '/dashboard/organizations',
        },
        {
            title: 'Просмотр',
            href: '#',
        },
    ];

    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState<number | null>(null);

    const {
        staffList,
        hasMoreStaff,
        staffForm,
        resetForm,
        fetchStaffMember,
        submitStaff,
        deleteStaff,
        loadMoreStaff,
    } = useOrganizationStaff({
        organizationId: organization.id,
        initialStaff: Array.isArray(organization.staff)
            ? organization.staff
            : [],
    });

    const handleCreateStaff = () => {
        setEditingStaffId(null);
        resetForm();
        setIsStaffModalOpen(true);
    };

    const handleEditStaff = async (staffId: number) => {
        const staffMember = await fetchStaffMember(staffId);
        if (staffMember) {
            setEditingStaffId(staffId);
            const nameParts = staffMember.full_name.split(' ');
            staffForm.setData({
                last_name: nameParts[0] || '',
                first_name: nameParts[1] || '',
                middle_name: nameParts.slice(2).join(' ') || '',
                position:
                    staffMember.position === 'Директор'
                        ? ''
                        : staffMember.position,
                is_director: staffMember.position === 'Директор',
                email: staffMember.email || '',
                address: staffMember.address || '',
                photo: staffMember.photo || null,
            });
            setIsStaffModalOpen(true);
        }
    };

    const handleSubmitStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await submitStaff(staffForm.data, editingStaffId);
        if (success) {
            setIsStaffModalOpen(false);
        }
    };

    const handleDeleteStaff = async (staffId: number) => {
        if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
            return;
        }
        await deleteStaff(staffId);
    };

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

    const peopleMenuItems = [
        {
            title: 'Пользователи',
            description: 'Управление пользователями',
            href: `/dashboard/organizations/${organization.id}/users`,
            icon: Users,
            color: 'bg-slate-500',
        },
        {
            title: 'Галерея',
            description: 'Управление медиафайлами',
            href: `/dashboard/organizations/${organization.id}/gallery`,
            icon: Eye,
            color: 'bg-rose-500',
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {organization.name}
                                </h1>
                                <StatusBadge status={organization.status} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                {getTypeLabel(organization.type)}
                                {organization.region?.name &&
                                    ` • ${organization.region.name}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            {organization.primary_site ||
                            (organization.sites &&
                                organization.sites.length > 0) ? (
                                <Link
                                    href={`/dashboard/organizations/${organization.id}/sites/${
                                        organization.primary_site?.id ||
                                        organization.sites?.[0]?.id
                                    }/builder`}
                                >
                                    <Button variant="default" size="sm">
                                        <Globe className="mr-2 h-4 w-4" />
                                        Конструктор сайта
                                    </Button>
                                </Link>
                            ) : (
                                <Link
                                    href={`/dashboard/organizations/${organization.id}/sites/create`}
                                >
                                    <Button variant="default" size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Создать сайт
                                    </Button>
                                </Link>
                            )}
                            <Link
                                href={`/dashboard/organizations/${organization.id}/reports`}
                            >
                                <Button variant="outline" size="sm">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Отчеты
                                </Button>
                            </Link>
                            <Link
                                href={`/dashboard/organizations/${organization.id}/edit`}
                            >
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
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
                                            <div className="text-2xl font-bold">
                                                {card.value}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {card.helperText}
                                            </p>
                                            {card.action ? (
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
                                            ) : null}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Контактная информация и персонал */}
                    <div className="space-y-6">
                        <OrganizationContactCard organization={organization} />

                        {/* Директор */}
                        {organization.director && organization.director.id && (
                            <OrganizationDirectorCard
                                director={organization.director}
                                onEdit={handleEditStaff}
                            />
                        )}

                        {/* Персонал */}
                        <OrganizationStaffList
                            staff={staffList}
                            hasMore={hasMoreStaff}
                            onAdd={handleCreateStaff}
                            onEdit={handleEditStaff}
                            onDelete={handleDeleteStaff}
                            onLoadMore={loadMoreStaff}
                        />
                    </div>
                </div>

                {/* Модальное окно для создания/редактирования персонала */}
                <OrganizationStaffModal
                    open={isStaffModalOpen}
                    onOpenChange={setIsStaffModalOpen}
                    formData={staffForm.data}
                    onFormDataChange={(key, value) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (staffForm.setData as any)(key, value);
                    }}
                    onSubmit={handleSubmitStaff}
                    isEditing={editingStaffId !== null}
                    organizationId={organization.id}
                    director={organization.director}
                />
            </div>
        </AppLayout>
    );
}
