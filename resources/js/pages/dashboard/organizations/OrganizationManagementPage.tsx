import YandexMap, { MapMarker } from '@/components/maps/YandexMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import type { MoneyAmount } from '@/types/money';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Edit,
    Eye,
    List,
    MapPin,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Админ панель',
        href: dashboard().url,
    },
    {
        title: 'Школы',
        href: '/dashboard/organizations',
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
    logo?: string;
    created_at: string;
    updated_at: string;
    members_count?: number;
    donations_count?: number;
    donations_total?: number;
    region?: {
        name: string;
    };
    city?: {
        name: string;
    };
    latitude?: number | null;
    longitude?: number | null;
    needs?: {
        target: MoneyAmount;
        collected: MoneyAmount;
        progress_percentage: number;
    } | null;
}

interface Props {
    organizations: {
        data: Organization[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        type?: string;
        sort_by?: string;
        sort_direction?: string;
        per_page?: number;
    };
    terminology: {
        page_title: string;
        page_description: string;
        create_button: string;
        total_count: string;
        no_organizations: string;
    };
}

export default function OrganizationManagementPage({
    organizations,
    filters,
    terminology,
}: Props) {
    const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
    const [search, setSearch] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(
        filters.sort_direction || 'desc',
    );

    // Подготовка маркеров для карты
    const mapMarkers: MapMarker[] = useMemo(() => {
        return organizations.data
            .filter((org) => org.latitude && org.longitude)
            .map((org) => ({
                id: org.id,
                position: [org.latitude!, org.longitude!] as [number, number],
                hint: org.name,
                balloon: `<div>
                    <h3>${org.name}</h3>
                    ${org.description ? `<p>${org.description}</p>` : ''}
                    ${org.region ? `<p>Регион: ${org.region.name}</p>` : ''}
                    ${org.city ? `<p>Город: ${org.city.name}</p>` : ''}
                    <a href="/dashboard/organizations/${org.id}/edit">Редактировать</a>
                </div>`,
            }));
    }, [organizations.data]);

    // Центр карты на основе всех организаций
    const mapCenter: [number, number] = useMemo(() => {
        if (mapMarkers.length === 0) return [55.751244, 37.618423]; // Москва по умолчанию

        const latitudes = mapMarkers.map((m) => m.position[0]);
        const longitudes = mapMarkers.map((m) => m.position[1]);
        const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
        const avgLon =
            longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

        return [avgLat, avgLon];
    }, [mapMarkers]);

    const handleSearch = () => {
        router.get(
            '/dashboard/organizations',
            {
                search,
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

    const handleDelete = (organization: Organization) => {
        if (
            confirm(
                `Вы уверены, что хотите удалить организацию "${organization.name}"?`,
            )
        ) {
            router.delete(`/dashboard/organizations/${organization.id}`, {
                onSuccess: () => {
                    // Обновляем страницу после удаления
                    router.reload();
                },
            });
        }
    };

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
        };
        return typeLabels[type] || type;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={terminology.page_title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {terminology.page_title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {terminology.page_description}
                        </p>
                    </div>
                    <Link href="/dashboard/organizations/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {terminology.create_button}
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="flex items-center space-x-2">
                                    <Search className="h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Поиск организаций..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-64"
                                    />
                                </div>

                                <Select
                                    value={`${sortBy}-${sortDirection}`}
                                    onValueChange={(value) => {
                                        const [field, direction] =
                                            value.split('-');
                                        setSortBy(field);
                                        setSortDirection(direction);
                                    }}
                                >
                                    <option value="created_at-desc">
                                        Новые сначала
                                    </option>
                                    <option value="created_at-asc">
                                        Старые сначала
                                    </option>
                                    <option value="name-asc">
                                        По названию (А-Я)
                                    </option>
                                    <option value="name-desc">
                                        По названию (Я-А)
                                    </option>
                                    <option value="updated_at-desc">
                                        Недавно обновленные
                                    </option>
                                </Select>
                            </div>

                            <Button onClick={handleSearch} variant="outline">
                                Применить фильтры
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`border-b-2 px-1 py-4 text-sm font-medium ${
                                activeTab === 'list'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <List className="mr-2 inline-block h-4 w-4" />
                            Список
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`border-b-2 px-1 py-4 text-sm font-medium ${
                                activeTab === 'map'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <MapPin className="mr-2 inline-block h-4 w-4" />
                            Карта
                        </button>
                    </nav>
                </div>

                {/* Organizations List */}
                {activeTab === 'list' && (
                    <>
                        {organizations.data.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {organizations.data.map((organization) => (
                                    <Card
                                        key={organization.id}
                                        className="overflow-hidden"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {organization.logo ? (
                                                        <img
                                                            src={
                                                                organization.logo
                                                            }
                                                            alt={
                                                                organization.name
                                                            }
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                                            <Building2 className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                                                            {organization.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {getTypeLabel(
                                                                organization.type,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(
                                                    organization.status,
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-0">
                                            {organization.description && (
                                                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {organization.description}
                                                </p>
                                            )}

                                            <div className="mb-4 flex items-center space-x-4 text-sm text-gray-500">
                                                {organization.region && (
                                                    <span>
                                                        {
                                                            organization.region
                                                                .name
                                                        }
                                                    </span>
                                                )}
                                                {organization.city && (
                                                    <span>
                                                        •{' '}
                                                        {organization.city.name}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {organization.members_count ||
                                                            0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Участники
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {organization.donations_count ||
                                                            0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Донаты
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {organization.donations_total
                                                            ? new Intl.NumberFormat(
                                                                  'ru-RU',
                                                              ).format(
                                                                  organization.donations_total,
                                                              ) + ' ₽'
                                                            : '0 ₽'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Собрано
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex space-x-1">
                                                    <Link
                                                        href={`/dashboard/organizations/${organization.id}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/organizations/${organization.id}/edit`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(
                                                            organization,
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-12">
                                    <div className="text-center">
                                        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                            {terminology.no_organizations}
                                        </h3>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                                            Попробуйте изменить параметры поиска
                                            или создайте новую организацию
                                        </p>
                                        <div className="mt-6">
                                            <Link href="/dashboard/organizations/create">
                                                <Button>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    {terminology.create_button}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pagination */}
                        {organizations.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Показано{' '}
                                    {(organizations.current_page - 1) *
                                        organizations.per_page +
                                        1}{' '}
                                    -{' '}
                                    {Math.min(
                                        organizations.current_page *
                                            organizations.per_page,
                                        organizations.total,
                                    )}{' '}
                                    из {organizations.total}{' '}
                                    {terminology.total_count.toLowerCase()}
                                </div>
                                <div className="flex space-x-2">
                                    {organizations.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                router.get(
                                                    '/dashboard/organizations',
                                                    {
                                                        ...filters,
                                                        page:
                                                            organizations.current_page -
                                                            1,
                                                    },
                                                    { preserveState: true },
                                                );
                                            }}
                                        >
                                            Предыдущая
                                        </Button>
                                    )}
                                    {organizations.current_page <
                                        organizations.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                router.get(
                                                    '/dashboard/organizations',
                                                    {
                                                        ...filters,
                                                        page:
                                                            organizations.current_page +
                                                            1,
                                                    },
                                                    { preserveState: true },
                                                );
                                            }}
                                        >
                                            Следующая
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Organizations Map */}
                {activeTab === 'map' && (
                    <Card>
                        <CardContent className="p-0">
                            <div style={{ height: '600px', width: '100%' }}>
                                <YandexMap
                                    center={mapCenter}
                                    zoom={mapMarkers.length > 0 ? 10 : 6}
                                    markers={mapMarkers}
                                    height="600px"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
