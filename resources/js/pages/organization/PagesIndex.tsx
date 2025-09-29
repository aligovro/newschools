import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Copy,
    Edit,
    Eye,
    FileText,
    Globe,
    MoreHorizontal,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Page {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'private' | 'scheduled';
    template: string;
    is_homepage: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    parent?: Page;
    url: string;
}

interface Organization {
    id: number;
    name: string;
    domain: string;
}

interface PagesIndexProps {
    organization: Organization;
    pages: {
        data: Page[];
        links: any[];
        meta: any;
    };
}

const PagesIndex: React.FC<PagesIndexProps> = ({ organization, pages }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const filteredPages = pages.data.filter((page) => {
        const matchesSearch =
            page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            page.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            selectedStatus === 'all' || page.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: 'Черновик', variant: 'secondary' as const },
            published: { label: 'Опубликовано', variant: 'success' as const },
            private: { label: 'Приватная', variant: 'warning' as const },
            scheduled: { label: 'Запланировано', variant: 'info' as const },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.draft;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getTemplateIcon = (template: string) => {
        const iconMap = {
            default: <FileText className="h-4 w-4" />,
            'full-width': <Globe className="h-4 w-4" />,
            landing: <Globe className="h-4 w-4" />,
            blog: <FileText className="h-4 w-4" />,
            contact: <FileText className="h-4 w-4" />,
            about: <FileText className="h-4 w-4" />,
        };
        return (
            iconMap[template as keyof typeof iconMap] || (
                <FileText className="h-4 w-4" />
            )
        );
    };

    const handleDelete = (pageId: number) => {
        if (confirm('Вы уверены, что хотите удалить эту страницу?')) {
            router.delete(
                route('organization.pages.destroy', {
                    organization: organization.id,
                    page: pageId,
                }),
            );
        }
    };

    const handleDuplicate = (pageId: number) => {
        router.post(
            route('organization.pages.duplicate', {
                organization: organization.id,
                page: pageId,
            }),
        );
    };

    const handleStatusChange = (pageId: number, newStatus: string) => {
        router.post(
            route('organization.pages.update-status', {
                organization: organization.id,
                page: pageId,
            }),
            {
                status: newStatus,
            },
        );
    };

    return (
        <AppLayout>
            <Head title={`Страницы - ${organization.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Страницы
                        </h1>
                        <p className="text-muted-foreground">
                            Управление страницами сайта {organization.name}
                        </p>
                    </div>
                    <Link
                        href={route(
                            'organization.pages.create',
                            organization.id,
                        )}
                        className="inline-flex items-center gap-2"
                    >
                        <Button>
                            <Plus className="h-4 w-4" />
                            Создать страницу
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <Input
                                    placeholder="Поиск страниц..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                            <select
                                value={selectedStatus}
                                onChange={(e) =>
                                    setSelectedStatus(e.target.value)
                                }
                                className="border-input bg-background ring-offset-background focus:ring-ring rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2"
                            >
                                <option value="all">Все статусы</option>
                                <option value="published">Опубликовано</option>
                                <option value="draft">Черновик</option>
                                <option value="private">Приватная</option>
                                <option value="scheduled">Запланировано</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Pages List */}
                <div className="space-y-4">
                    {filteredPages.map((page) => (
                        <Card
                            key={page.id}
                            className="transition-shadow hover:shadow-md"
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            {getTemplateIcon(page.template)}
                                            <h3 className="text-lg font-semibold">
                                                <Link
                                                    href={route(
                                                        'organization.pages.show',
                                                        {
                                                            organization:
                                                                organization.id,
                                                            page: page.id,
                                                        },
                                                    )}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {page.title}
                                                </Link>
                                            </h3>
                                            {page.is_homepage && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    Главная
                                                </Badge>
                                            )}
                                            {getStatusBadge(page.status)}
                                        </div>

                                        <div className="text-muted-foreground space-y-1 text-sm">
                                            <p>
                                                <span className="font-medium">
                                                    URL:
                                                </span>{' '}
                                                {page.url}
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Шаблон:
                                                </span>{' '}
                                                {page.template}
                                            </p>
                                            {page.parent && (
                                                <p>
                                                    <span className="font-medium">
                                                        Родительская страница:
                                                    </span>{' '}
                                                    {page.parent.title}
                                                </p>
                                            )}
                                            <p>
                                                <span className="font-medium">
                                                    Создано:
                                                </span>{' '}
                                                {new Date(
                                                    page.created_at,
                                                ).toLocaleDateString('ru-RU')}
                                            </p>
                                            {page.published_at && (
                                                <p>
                                                    <span className="font-medium">
                                                        Опубликовано:
                                                    </span>{' '}
                                                    {new Date(
                                                        page.published_at,
                                                    ).toLocaleDateString(
                                                        'ru-RU',
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={page.url}
                                            target="_blank"
                                            className="hover:bg-muted rounded-md p-2 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={route(
                                                            'organization.pages.show',
                                                            {
                                                                organization:
                                                                    organization.id,
                                                                page: page.id,
                                                            },
                                                        )}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Просмотр
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={route(
                                                            'organization.pages.edit',
                                                            {
                                                                organization:
                                                                    organization.id,
                                                                page: page.id,
                                                            },
                                                        )}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Редактировать
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDuplicate(page.id)
                                                    }
                                                >
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Дублировать
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            page.id,
                                                            page.status ===
                                                                'published'
                                                                ? 'draft'
                                                                : 'published',
                                                        )
                                                    }
                                                >
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {page.status === 'published'
                                                        ? 'Снять с публикации'
                                                        : 'Опубликовать'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDelete(page.id)
                                                    }
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Удалить
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredPages.length === 0 && (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="space-y-4">
                                    <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                                        <FileText className="text-muted-foreground h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Страницы не найдены
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {searchTerm ||
                                            selectedStatus !== 'all'
                                                ? 'Попробуйте изменить фильтры поиска'
                                                : 'Создайте первую страницу для вашего сайта'}
                                        </p>
                                    </div>
                                    {!searchTerm &&
                                        selectedStatus === 'all' && (
                                            <Link
                                                href={route(
                                                    'organization.pages.create',
                                                    organization.id,
                                                )}
                                            >
                                                <Button>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Создать страницу
                                                </Button>
                                            </Link>
                                        )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default PagesIndex;
