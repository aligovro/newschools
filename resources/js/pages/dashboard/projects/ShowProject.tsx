import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as projectIndex } from '@/routes/organizations/projects';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Edit,
    Target,
    Trash2,
    TrendingUp,
    Users,
} from 'lucide-react';

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
    target_amount: number;
    collected_amount: number;
    status: 'draft' | 'active' | 'completed' | 'cancelled' | 'suspended';
    featured: boolean;
    start_date?: string;
    end_date?: string;
    image?: string;
    gallery?: string[];
    views_count: number;
    donations_count: number;
    created_at: string;
    updated_at: string;
    categories?: {
        id: number;
        name: string;
        slug: string;
    }[];
}

interface Props {
    organization: Organization;
    project: Project;
}

export default function ShowProject({ organization, project }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Админ панель',
            href: '/dashboard',
        },
        {
            title: organization.name,
            href: `/dashboard/organizations/${organization.id}`,
        },
        {
            title: 'Проекты',
            href: projectIndex.url({ organization: organization.id }),
        },
        {
            title: project.title,
            href: '#',
        },
    ];

    const getProgressPercentage = () => {
        if (!project.target_amount || project.target_amount <= 0) {
            return 0;
        }
        return Math.min(
            100,
            (project.collected_amount / project.target_amount) * 100,
        );
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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Активен';
            case 'completed':
                return 'Завершен';
            case 'cancelled':
                return 'Отменен';
            case 'suspended':
                return 'Приостановлен';
            default:
                return 'Черновик';
        }
    };

    const handleDelete = () => {
        if (
            confirm(`Вы уверены, что хотите удалить проект "${project.title}"?`)
        ) {
            router.delete(
                `/dashboard/organizations/${organization.id}/projects/${project.id}`,
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={project.title} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={projectIndex.url({
                                organization: organization.id,
                            })}
                        >
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {project.title}
                            </h1>
                            {project.featured && (
                                <Badge className="mt-2 bg-yellow-500">
                                    Рекомендуемый проект
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/dashboard/organizations/${organization.id}/projects/${project.id}/edit`}
                        >
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Image */}
                        {project.image && (
                            <Card>
                                <CardContent className="p-0">
                                    <img
                                        src={`/storage/${project.image}`}
                                        alt={project.title}
                                        className="h-96 w-full rounded-lg object-cover"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Описание проекта</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {project.short_description && (
                                    <div
                                        className="mb-4 text-lg text-gray-700 prose prose-sm max-w-none"
                                        // HTML в кратком описании проекта задается администраторами,
                                        // поэтому мы считаем этот контент доверенным.
                                        dangerouslySetInnerHTML={{
                                            __html: project.short_description,
                                        }}
                                    />
                                )}
                                {project.description && (
                                    <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: project.description,
                                        }}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Gallery */}
                        {project.gallery && project.gallery.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Галерея</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                        {project.gallery.map((image, index) => (
                                            <img
                                                key={index}
                                                src={`/storage/${image}`}
                                                alt={`${project.title} ${index + 1}`}
                                                className="h-48 w-full rounded-lg object-cover"
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Прогресс сбора</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Собрано
                                    </span>
                                    <span className="text-lg font-semibold">
                                        {(
                                            project.collected_amount / 100
                                        ).toLocaleString('ru-RU')}{' '}
                                        ₽
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Цель
                                    </span>
                                    <span className="text-lg font-semibold">
                                        {(
                                            project.target_amount / 100
                                        ).toLocaleString('ru-RU')}{' '}
                                        ₽
                                    </span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full bg-blue-500 transition-all"
                                        style={{
                                            width: `${getProgressPercentage()}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-center text-sm text-gray-600">
                                    {getProgressPercentage().toFixed(0)}%
                                    собрано
                                </p>
                            </CardContent>
                        </Card>

                        {/* Project Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Информация о проекте</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Target className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">
                                            Категории
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        {(project.categories ?? []).length ? (
                                            project.categories?.map(
                                                (category) => (
                                                    <Badge
                                                        key={category.id}
                                                        variant="outline"
                                                    >
                                                        {category.name}
                                                    </Badge>
                                                ),
                                            )
                                        ) : (
                                            <Badge variant="outline">
                                                Без категории
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">
                                            Статус
                                        </span>
                                    </div>
                                    <Badge
                                        className={`${getStatusColor(project.status)} text-white`}
                                    >
                                        {getStatusLabel(project.status)}
                                    </Badge>
                                </div>

                                {project.start_date && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                Дата начала
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {new Date(
                                                project.start_date,
                                            ).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                )}

                                {project.end_date && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                Дата окончания
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {new Date(
                                                project.end_date,
                                            ).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">
                                            Донатеров
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        {project.donations_count}
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
