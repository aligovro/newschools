import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    Clock,
    MapPin,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Админ панель',
        href: dashboard().url,
    },
    {
        title: 'Предложенные школы',
        href: '/dashboard/suggested-organizations',
    },
];

interface SuggestedOrganization {
    id: number;
    name: string;
    city_name?: string;
    city?: {
        id: number;
        name: string;
    };
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    reviewed_by?: number;
    reviewed_at?: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    suggestedOrganizations: {
        data: SuggestedOrganization[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        sort_by?: string;
        sort_direction?: string;
        per_page?: number;
    };
}

export default function SuggestedOrganizationManagementPage({
    suggestedOrganizations,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(
        filters.status ? filters.status : 'all',
    );
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(
        filters.sort_direction || 'desc',
    );

    const handleSearch = () => {
        router.get(
            '/dashboard/suggested-organizations',
            {
                search,
                status: statusFilter === 'all' ? undefined : statusFilter,
                sort_by: sortBy,
                sort_direction: sortDirection,
                per_page: filters.per_page || 15,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDelete = (school: SuggestedOrganization) => {
        if (
            confirm(
                `Вы уверены, что хотите удалить предложенную школу "${school.name}"?`,
            )
        ) {
            router.delete(`/dashboard/suggested-organizations/${school.id}`, {
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const handleStatusChange = (
        school: SuggestedOrganization,
        newStatus: 'pending' | 'approved' | 'rejected',
    ) => {
        router.put(
            `/dashboard/suggested-organizations/${school.id}`,
            {
                status: newStatus,
            },
            {
                preserveState: true,
                onSuccess: () => {
                    router.reload();
                },
            },
        );
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: {
                label: 'Ожидает рассмотрения',
                variant: 'outline' as const,
                icon: Clock,
            },
            approved: {
                label: 'Одобрена',
                variant: 'default' as const,
                icon: CheckCircle2,
            },
            rejected: {
                label: 'Отклонена',
                variant: 'secondary' as const,
                icon: XCircle,
            },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.pending;
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Предложенные школы" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Предложенные школы
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Управление предложенными посетителями школами
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="flex items-center space-x-2">
                                    <Search className="h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Поиск по названию, городу, адресу..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-64"
                                    />
                                </div>

                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Все статусы" />
                                    </SelectTrigger>
                                    <SelectContent>
                                <SelectItem value="all">
                                            Все статусы
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Ожидает рассмотрения
                                        </SelectItem>
                                        <SelectItem value="approved">
                                            Одобрена
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            Отклонена
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={`${sortBy}-${sortDirection}`}
                                    onValueChange={(value) => {
                                        const [field, direction] =
                                            value.split('-');
                                        setSortBy(field);
                                        setSortDirection(direction);
                                    }}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at-desc">
                                            Новые сначала
                                        </SelectItem>
                                        <SelectItem value="created_at-asc">
                                            Старые сначала
                                        </SelectItem>
                                        <SelectItem value="name-asc">
                                            По названию (А-Я)
                                        </SelectItem>
                                        <SelectItem value="name-desc">
                                            По названию (Я-А)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleSearch} variant="outline">
                                Применить фильтры
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Schools List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Список предложенных школ (
                                {suggestedOrganizations.total})
                            </h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {suggestedOrganizations.data.length === 0 ? (
                            <div className="py-12 text-center text-gray-500">
                                Нет предложенных школ
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {suggestedOrganizations.data.map((school) => (
                                    <div
                                        key={school.id}
                                        className="flex items-start justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Building2 className="h-5 w-5 text-gray-400" />
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {school.name}
                                                </h3>
                                                {getStatusBadge(school.status)}
                                            </div>
                                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                {school.city_name && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>
                                                            {school.city_name}
                                                        </span>
                                                    </div>
                                                )}
                                                {school.address && (
                                                    <div className="ml-6">
                                                        {school.address}
                                                    </div>
                                                )}
                                                {school.latitude &&
                                                    school.longitude && (
                                                        <div className="ml-6 text-xs text-gray-500">
                                                            Координаты:{' '}
                                                            {school.latitude.toFixed(
                                                                6,
                                                            )}
                                                            ,{' '}
                                                            {school.longitude.toFixed(
                                                                6,
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Создано:{' '}
                                                {new Date(
                                                    school.created_at,
                                                ).toLocaleString('ru-RU')}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex items-center gap-2">
                                            {school.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                school,
                                                                'approved',
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <CheckCircle2 className="mr-1 h-4 w-4" />
                                                        Одобрить
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                school,
                                                                'rejected',
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <XCircle className="mr-1 h-4 w-4" />
                                                        Отклонить
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    handleDelete(school)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {suggestedOrganizations.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Показано{' '}
                                    {(suggestedOrganizations.current_page - 1) *
                                        suggestedOrganizations.per_page +
                                        1}{' '}
                                    -{' '}
                                    {Math.min(
                                        suggestedOrganizations.current_page *
                                            suggestedOrganizations.per_page,
                                        suggestedOrganizations.total,
                                    )}{' '}
                                    из {suggestedOrganizations.total}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            suggestedOrganizations.current_page ===
                                            1
                                        }
                                        onClick={() => {
                                            router.get(
                                                '/dashboard/suggested-organizations',
                                                {
                                                    ...filters,
                                                    page:
                                                        suggestedOrganizations.current_page -
                                                        1,
                                                },
                                            );
                                        }}
                                    >
                                        Назад
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            suggestedOrganizations.current_page ===
                                            suggestedOrganizations.last_page
                                        }
                                        onClick={() => {
                                            router.get(
                                                '/dashboard/suggested-organizations',
                                                {
                                                    ...filters,
                                                    page:
                                                        suggestedOrganizations.current_page +
                                                        1,
                                                },
                                            );
                                        }}
                                    >
                                        Вперед
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
