import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { newsApi, type NewsItem } from '@/lib/api/news';
import { router, useForm, Link, Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, Eye, FilePlus2, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface ContextPayload {
    mode: 'global' | 'organization';
    organization: {
        id: number;
        name: string;
        slug: string;
    } | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface FiltersPayload {
    search?: string;
    status?: string;
    visibility?: string;
    type?: string;
    organization_id?: number;
    featured?: boolean;
    upcoming?: boolean;
    starts_from?: string;
    starts_to?: string;
}

interface LookupsPayload {
    organizations: Array<{
        id: number;
        name: string;
    }>;
}

interface PermissionsPayload {
    canCreate?: boolean;
    canManage?: boolean;
}

interface NewsIndexProps {
    context: ContextPayload;
    news: {
        data: NewsItem[];
        meta: PaginationMeta;
    };
    filters: FiltersPayload;
    lookups: LookupsPayload;
    permissions: PermissionsPayload;
}

const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    scheduled: 'bg-blue-500',
    published: 'bg-green-600',
    archived: 'bg-gray-400',
};

const visibilityLabels: Record<string, string> = {
    public: 'Публично',
    organization: 'Для организации',
    private: 'Приватно',
};

export default function NewsIndex({
    context,
    news,
    filters,
    lookups,
    permissions,
}: NewsIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [visibility, setVisibility] = useState(filters.visibility ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const [organizationId, setOrganizationId] = useState<string>(
        filters.organization_id?.toString() ?? '',
    );
    const [featuredOnly, setFeaturedOnly] = useState<boolean>(
        Boolean(filters.featured),
    );
    const [upcomingOnly, setUpcomingOnly] = useState<boolean>(
        Boolean(filters.upcoming),
    );
    const [processing, setProcessing] = useState(false);

    const breadcrumbs = useMemo(() => {
        const base = [
            {
                title: 'Админ панель',
                href: '/dashboard',
            },
        ];

        if (context.mode === 'organization' && context.organization) {
            base.push({
                title: 'Школы',
                href: '/dashboard/organizations',
            });
            base.push({
                title: context.organization.name,
                href: `/dashboard/organizations/${context.organization.id}`,
            });
        }

        base.push({
            title: 'События и новости',
            href:
                context.mode === 'global'
                    ? '/dashboard/news'
                    : `/dashboard/organizations/${context.organization?.id}/news`,
        });

        return base;
    }, [context]);

    const applyFilters = useCallback(() => {
        const query: Record<string, string | number | boolean> = {};

        if (search.trim().length > 0) {
            query.search = search.trim();
        }
        if (status) {
            query.status = status;
        }
        if (visibility) {
            query.visibility = visibility;
        }
        if (type) {
            query.type = type;
        }
        if (featuredOnly) {
            query.featured = true;
        }
        if (upcomingOnly) {
            query.upcoming = true;
        }
        if (organizationId) {
            query.organization_id = Number(organizationId);
        }

        const url =
            context.mode === 'global'
                ? '/dashboard/news'
                : `/dashboard/organizations/${context.organization?.id}/news`;

        router.visit(url, {
            data: query,
            preserveScroll: true,
        });
    }, [
        context.mode,
        context.organization,
        featuredOnly,
        organizationId,
        search,
        status,
        type,
        upcomingOnly,
        visibility,
    ]);

    const resetFilters = useCallback(() => {
        setSearch('');
        setStatus('');
        setVisibility('');
        setType('');
        setFeaturedOnly(false);
        setUpcomingOnly(false);
        setOrganizationId('');

        const url =
            context.mode === 'global'
                ? '/dashboard/news'
                : `/dashboard/organizations/${context.organization?.id}/news`;

        router.visit(url, {
            data: {},
            preserveScroll: true,
        });
    }, [context.mode, context.organization]);

    const handleDelete = useCallback(
        async (item: NewsItem) => {
            if (!permissions.canManage) {
                return;
            }

            const confirmed = confirm(
                `Удалить материал "${item.title}"? Это действие нельзя отменить.`,
            );

            if (!confirmed) {
                return;
            }

            try {
                setProcessing(true);
                await newsApi.delete(item.id);
                applyFilters();
            } catch (error) {
                console.error('Failed to delete news item', error);
                alert('Не удалось удалить материал. Попробуйте позже.');
            } finally {
                setProcessing(false);
            }
        },
        [applyFilters, permissions.canManage],
    );

    const createPath =
        context.mode === 'global'
            ? '/dashboard/news/create'
            : `/dashboard/organizations/${context.organization?.id}/news/create`;

    const editPath = (item: NewsItem) =>
        context.mode === 'global'
            ? `/dashboard/news/${item.id}/edit`
            : `/dashboard/organizations/${context.organization?.id}/news/${item.id}/edit`;

    const showPath = (item: NewsItem) =>
        context.mode === 'global'
            ? `/dashboard/news/${item.id}`
            : `/dashboard/organizations/${context.organization?.id}/news/${item.id}`;

    const canCreate = permissions.canCreate ?? permissions.canManage ?? false;

    const headerActions = canCreate ? (
        <Button asChild>
            <Link href={createPath}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Добавить материал
            </Link>
        </Button>
    ) : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs} headerActions={headerActions}>
            <Head title="События и новости" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            События и новости
                        </h1>
                    </div>
                    {context.mode === 'organization' && context.organization ? (
                        <p className="text-gray-600">
                            {context.organization.name}
                        </p>
                    ) : (
                        <p className="text-gray-600">
                            Управляйте материалами всех организаций
                        </p>
                    )}
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle>Фильтры</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Поиск</Label>
                                <Input
                                    id="search"
                                    placeholder="Поиск по названию, тегам..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Статус</Label>
                                <Select
                                    value={status || 'all'}
                                    onValueChange={(value) =>
                                        setStatus(value === 'all' ? '' : value)
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Все" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        <SelectItem value="draft">
                                            Черновик
                                        </SelectItem>
                                        <SelectItem value="scheduled">
                                            Запланировано
                                        </SelectItem>
                                        <SelectItem value="published">
                                            Опубликовано
                                        </SelectItem>
                                        <SelectItem value="archived">
                                            Архив
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="visibility">Видимость</Label>
                                <Select
                                    value={visibility || 'all'}
                                    onValueChange={(value) =>
                                        setVisibility(value === 'all' ? '' : value)
                                    }
                                >
                                    <SelectTrigger id="visibility">
                                        <SelectValue placeholder="Все" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        <SelectItem value="public">
                                            Публично
                                        </SelectItem>
                                        <SelectItem value="organization">
                                            Для организации
                                        </SelectItem>
                                        <SelectItem value="private">
                                            Приватно
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Тип</Label>
                                <Select
                                    value={type || 'all'}
                                    onValueChange={(value) =>
                                        setType(value === 'all' ? '' : value)
                                    }
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Все" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        <SelectItem value="event">
                                            Событие
                                        </SelectItem>
                                        <SelectItem value="news">
                                            Новость
                                        </SelectItem>
                                        <SelectItem value="announcement">
                                            Анонс
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {context.mode === 'global' && lookups.organizations.length > 0 && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="organization">
                                        Организация
                                    </Label>
                                    <Select
                                        value={organizationId || 'all'}
                                        onValueChange={(value) =>
                                            setOrganizationId(
                                                value === 'all' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="organization">
                                            <SelectValue placeholder="Все организации" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Все организации
                                            </SelectItem>
                                            {lookups.organizations.map((org) => (
                                                <SelectItem
                                                    key={org.id}
                                                    value={org.id.toString()}
                                                >
                                                    {org.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="featured"
                                    checked={featuredOnly}
                                    onCheckedChange={setFeaturedOnly}
                                />
                                <Label htmlFor="featured">
                                    Только избранные
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="upcoming"
                                    checked={upcomingOnly}
                                    onCheckedChange={setUpcomingOnly}
                                />
                                <Label htmlFor="upcoming">
                                    Только будущие события
                                </Label>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                onClick={applyFilters}
                                disabled={processing}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Применить
                            </Button>
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                disabled={processing}
                            >
                                Сбросить
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Название</TableHead>
                                    <TableHead>Организация</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead>Видимость</TableHead>
                                    <TableHead>Начало</TableHead>
                                    <TableHead>Обновлено</TableHead>
                                    <TableHead className="text-right">
                                        Действия
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {news.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-12 text-center text-gray-500"
                                        >
                                            Пока нет материалов
                                        </TableCell>
                                    </TableRow>
                                )}

                                {news.data.map((item) => {
                                    const statusColor =
                                        statusColors[item.status] ?? 'bg-slate-500';

                                    const organizationLabel =
                                        item.organization?.name ??
                                        context.organization?.name ??
                                        '—';

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="max-w-xs">
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-gray-900">
                                                        {item.title}
                                                    </p>
                                                    {item.subtitle && (
                                                        <p className="text-sm text-gray-500">
                                                            {item.subtitle}
                                                        </p>
                                                    )}
                                                    {item.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.tags.slice(0, 3).map((tag) => (
                                                                <Badge
                                                                    key={tag}
                                                                    variant="secondary"
                                                                >
                                                                    #{tag}
                                                                </Badge>
                                                            ))}
                                                            {item.tags.length > 3 && (
                                                                <Badge variant="outline">
                                                                    +{item.tags.length - 3}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{organizationLabel}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${statusColor} text-white`}
                                                >
                                                    {item.status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {visibilityLabels[item.visibility] ??
                                                    item.visibility_label}
                                            </TableCell>
                                            <TableCell>
                                                {item.starts_at
                                                    ? format(
                                                          new Date(item.starts_at),
                                                          'dd.MM.yyyy HH:mm',
                                                      )
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {item.updated_at
                                                    ? format(
                                                          new Date(item.updated_at),
                                                          'dd.MM.yyyy HH:mm',
                                                      )
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="space-x-2 text-right">
                                                <Button
                                                    asChild
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Link href={showPath(item)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                {permissions.canManage && (
                                                    <>
                                                        <Button
                                                            asChild
                                                            size="icon"
                                                            variant="ghost"
                                                        >
                                                            <Link href={editPath(item)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            disabled={processing}
                                                            onClick={() =>
                                                                handleDelete(item)
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

