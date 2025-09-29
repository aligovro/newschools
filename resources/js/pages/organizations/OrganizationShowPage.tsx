import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Globe,
    Mail,
    MapPin,
    Phone,
    Settings,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Организации',
        href: '/dashboard/organizations',
    },
    {
        title: 'Просмотр',
        href: '#',
    },
];

interface Organization {
    id: number;
    name: string;
    slug: string;
    description?: string;
    type: string;
    status: 'active' | 'inactive' | 'pending';
    is_public: boolean;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    logo?: string;
    created_at: string;
    updated_at: string;
    region?: {
        name: string;
    };
    city?: {
        name: string;
    };
    settlement?: {
        name: string;
    };
    members_count?: number;
    donations_count?: number;
    donations_total?: number;
}

interface Props {
    organization: Organization;
}

export default function OrganizationShowPage({ organization }: Props) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Активна', variant: 'default' as const },
            inactive: { label: 'Неактивна', variant: 'secondary' as const },
            pending: { label: 'На рассмотрении', variant: 'outline' as const },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getTypeLabel = (type: string) => {
        const typeLabels: Record<string, string> = {
            school: 'Школа',
            university: 'Университет',
            kindergarten: 'Детский сад',
            other: 'Другое',
        };
        return typeLabels[type] || type;
    };

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
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {organization.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {getTypeLabel(organization.type)} •{' '}
                                {organization.region?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(organization.status)}
                        <div className="flex space-x-1">
                            <Link
                                href={`/dashboard/organizations/${organization.id}/edit`}
                            >
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link
                                href={`/organization/${organization.id}/admin`}
                            >
                                <Button variant="outline" size="sm">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Основная информация */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Информация об организации</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {organization.logo && (
                                    <div className="flex justify-center">
                                        <img
                                            src={organization.logo}
                                            alt={organization.name}
                                            className="h-24 w-24 rounded-lg object-cover"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Тип
                                        </p>
                                        <p className="text-sm">
                                            {getTypeLabel(organization.type)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Статус
                                        </p>
                                        <div className="mt-1">
                                            {getStatusBadge(
                                                organization.status,
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {organization.description && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Описание
                                        </p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {organization.description}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {organization.members_count || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Участники
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {organization.donations_count || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Донаты
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {organization.donations_total
                                                ? new Intl.NumberFormat(
                                                      'ru-RU',
                                                  ).format(
                                                      organization.donations_total,
                                                  ) + ' ₽'
                                                : '0 ₽'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Собрано
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Контактная информация */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Контактная информация</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {organization.email && (
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">
                                                Email
                                            </p>
                                            <a
                                                href={`mailto:${organization.email}`}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                {organization.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {organization.phone && (
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">
                                                Телефон
                                            </p>
                                            <a
                                                href={`tel:${organization.phone}`}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                {organization.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {organization.address && (
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">
                                                Адрес
                                            </p>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {organization.address}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {organization.website && (
                                    <div className="flex items-center space-x-3">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">
                                                Веб-сайт
                                            </p>
                                            <a
                                                href={organization.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                {organization.website}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Системная информация</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Создана:
                                    </span>
                                    <span className="text-sm">
                                        {new Date(
                                            organization.created_at,
                                        ).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Обновлена:
                                    </span>
                                    <span className="text-sm">
                                        {new Date(
                                            organization.updated_at,
                                        ).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Публичная:
                                    </span>
                                    <span className="text-sm">
                                        {organization.is_public ? 'Да' : 'Нет'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
