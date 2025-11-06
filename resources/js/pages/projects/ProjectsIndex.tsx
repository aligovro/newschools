import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Target, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface Project {
    id: number;
    title: string;
    slug: string;
    short_description?: string;
    description?: string;
    category: string;
    target_amount: number;
    collected_amount: number;
    status: 'draft' | 'active' | 'completed' | 'cancelled' | 'suspended';
    featured: boolean;
    start_date?: string;
    end_date?: string;
    image?: string;
    views_count: number;
    donations_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    organization: Organization;
    projects: {
        data: Project[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Record<string, string>;
    filters: {
        status?: string;
        category?: string;
        search?: string;
        featured?: boolean;
    };
}

export default function ProjectsIndex({
    organization,
    projects,
    categories,
    filters,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category || '',
    );

    const handleFilter = () => {
        const query: Record<string, string> = {};

        if (searchQuery) {
            query.search = searchQuery;
        }
        if (statusFilter) {
            query.status = statusFilter;
        }
        if (categoryFilter) {
            query.category = categoryFilter;
        }

        router.visit(`/dashboard/organizations/${organization.id}/projects`, {
            data: query,
        });
    };

    const handleDelete = (project: Project) => {
        if (
            confirm(`Вы уверены, что хотите удалить проект "${project.title}"?`)
        ) {
            router.delete(
                `/dashboard/organizations/${organization.id}/projects/${project.id}`,
            );
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500';
            case 'completed':
                return 'bg-blue-500';
            case 'cancelled':
                return 'bg-red-500';
            case 'suspended':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getProgressPercentage = (project: Project) => {
        if (!project.target_amount || project.target_amount <= 0) {
            return 0;
        }
        return Math.min(
            100,
            (project.collected_amount / project.target_amount) * 100,
        );
    };

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
            href: `/dashboard/organizations/${organization.id}`,
        },
        {
            title: 'Проекты',
            href: `/dashboard/organizations/${organization.id}/projects`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Проекты - ${organization.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Проекты организации
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {organization.name}
                        </p>
                    </div>
                    <Link
                        href={`/dashboard/organizations/${organization.id}/projects/create`}
                    >
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Создать проект
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Фильтры</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Input
                                placeholder="Поиск по названию..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    setStatusFilter(value)
                                }
                            >
                                <option value="">Все статусы</option>
                                <option value="draft">Черновик</option>
                                <option value="active">Активный</option>
                                <option value="completed">Завершен</option>
                                <option value="cancelled">Отменен</option>
                                <option value="suspended">Приостановлен</option>
                            </Select>
                            <Select
                                value={categoryFilter}
                                onValueChange={(value) =>
                                    setCategoryFilter(value)
                                }
                            >
                                <option value="">Все категории</option>
                                {Object.entries(categories).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </Select>
                            <Button onClick={handleFilter}>
                                <Search className="mr-2 h-4 w-4" />
                                Применить
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.data.map((project) => (
                        <Card key={project.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">
                                            {project.title}
                                        </h3>
                                        {project.featured && (
                                            <Badge className="mt-1 bg-yellow-500">
                                                Рекомендуемый
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {project.image && (
                                    <img
                                        src={`/storage/${project.image}`}
                                        alt={project.title}
                                        className="mb-4 h-48 w-full rounded-lg object-cover"
                                    />
                                )}
                                {project.short_description && (
                                    <p className="mb-4 text-sm text-gray-600">
                                        {project.short_description}
                                    </p>
                                )}
                                <div className="mb-4">
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Собрано
                                        </span>
                                        <span className="font-semibold">
                                            {(
                                                project.collected_amount / 100
                                            ).toLocaleString('ru-RU')}{' '}
                                            ₽
                                        </span>
                                    </div>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Цель
                                        </span>
                                        <span className="font-semibold">
                                            {(
                                                project.target_amount / 100
                                            ).toLocaleString('ru-RU')}{' '}
                                            ₽
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-full bg-blue-500 transition-all"
                                            style={{
                                                width: `${getProgressPercentage(project)}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {getProgressPercentage(project).toFixed(
                                            0,
                                        )}
                                        % собрано
                                    </p>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={`${getStatusColor(
                                                project.status,
                                            )} text-white`}
                                        >
                                            {categories[project.category] ||
                                                project.category}
                                        </Badge>
                                    </div>
                                    <Badge
                                        className={`${getStatusColor(
                                            project.status,
                                        )} text-white`}
                                    >
                                        {project.status === 'active'
                                            ? 'Активен'
                                            : project.status === 'completed'
                                              ? 'Завершен'
                                              : project.status === 'cancelled'
                                                ? 'Отменен'
                                                : project.status === 'suspended'
                                                  ? 'Приостановлен'
                                                  : 'Черновик'}
                                    </Badge>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href={`/dashboard/organizations/${organization.id}/projects/${project.id}`}
                                        className="flex-1"
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Просмотр
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/dashboard/organizations/${organization.id}/projects/${project.id}/edit`}
                                        className="flex-1"
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Редакт.
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(project)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {projects.data.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Target className="mx-auto mb-4 h-24 w-24 text-gray-400" />
                            <h3 className="mb-2 text-xl font-semibold">
                                Нет проектов
                            </h3>
                            <p className="mb-6 text-gray-600">
                                Создайте первый проект для организации
                            </p>
                            <Link
                                href={`/dashboard/organizations/${organization.id}/projects/create`}
                            >
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Создать проект
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {projects.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: projects.last_page }).map(
                            (_, index) => {
                                const page = index + 1;
                                return (
                                    <Button
                                        key={page}
                                        variant={
                                            projects.current_page === page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() => {
                                            router.visit(
                                                `/dashboard/organizations/${organization.id}/projects`,
                                                {
                                                    data: { page },
                                                },
                                            );
                                        }}
                                    >
                                        {page}
                                    </Button>
                                );
                            },
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
