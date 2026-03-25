import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, FileText, Home, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Site {
    id: number;
    name: string;
    slug: string;
}

interface Page {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    status: string;
    is_homepage: boolean;
    is_public: boolean;
    show_in_navigation: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    parent?: { id: number; title: string; slug: string };
}

interface Props {
    site: Site;
    pages: {
        data: Page[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        status?: string;
        template?: string;
    };
    stats: {
        total: number;
        published: number;
        draft: number;
    };
}

const STATUS_CONFIG = {
    published: { label: 'Опубликована', dot: 'bg-green-500',  badge: 'default'   as const },
    draft:     { label: 'Черновик',     dot: 'bg-amber-400',  badge: 'secondary' as const },
    private:   { label: 'Приватная',    dot: 'bg-slate-400',  badge: 'outline'   as const },
} satisfies Record<string, { label: string; dot: string; badge: 'default' | 'secondary' | 'outline' }>;

function statusCfg(status: string) {
    return (
        STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
            label: status,
            dot: 'bg-slate-400',
            badge: 'outline' as const,
        }
    );
}

export default function SitePagesIndex({ site, pages, filters, stats }: Props) {
    const [searchTerm,    setSearchTerm]    = useState(filters.search || '');
    const [statusFilter,  setStatusFilter]  = useState(filters.status || 'all');
    const [allPages,      setAllPages]      = useState<Page[]>(pages.data);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // page=1 → сброс списка (новый поиск/фильтр), page>1 → дозагрузка
    // Дедупликация по id защищает от двойного срабатывания эффекта (StrictMode / Inertia)
    useEffect(() => {
        setAllPages((prev) => {
            if (pages.current_page === 1) return pages.data;
            const existing = new Set(prev.map((p) => p.id));
            return [...prev, ...pages.data.filter((p) => !existing.has(p.id))];
        });
        setIsLoadingMore(false);
    }, [pages]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Админ панель', href: '/dashboard' },
        { title: 'Сайты',       href: '/dashboard/sites' },
        { title: site.name,     href: `/dashboard/sites/${site.id}` },
        { title: 'Страницы',    href: `/dashboard/sites/${site.id}/pages` },
    ];

    const navigate = (extra: Record<string, string>) =>
        router.get(`/dashboard/sites/${site.id}/pages`, extra);

    const handleSearch = () =>
        navigate({
            search:   searchTerm,
            status:   statusFilter === 'all' ? '' : statusFilter,
            template: filters.template || '',
        });

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('all');
        navigate({});
    };

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        router.get(
            `/dashboard/sites/${site.id}/pages`,
            {
                search:   filters.search   || '',
                status:   filters.status   || '',
                template: filters.template || '',
                page:     String(pages.current_page + 1),
                per_page: String(pages.per_page),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleDelete = (pageId: number) => {
        if (confirm('Вы уверены, что хотите удалить эту страницу? Это действие нельзя отменить.')) {
            router.delete(`/dashboard/sites/${site.id}/pages/${pageId}`);
        }
    };

    const hasMore      = allPages.length < pages.total;
    const isFiltered   = !!(filters.search || (filters.status && filters.status !== 'all'));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Страницы — ${site.name}`} />

            <div className="space-y-4 p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Страницы</h1>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                            <span>
                                <span className="font-semibold text-foreground">{stats.total}</span> страниц
                            </span>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                                {stats.published} опубл.
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                                {stats.draft} {stats.draft === 1 ? 'черновик' : 'черновика'}
                            </span>
                        </div>
                    </div>
                    <Link href={`/dashboard/sites/${site.id}/pages/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Создать страницу
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="min-w-48 flex-1">
                        <Input
                            placeholder="Поиск по названию, slug, описанию..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все статусы</SelectItem>
                            <SelectItem value="published">Опубликована</SelectItem>
                            <SelectItem value="draft">Черновик</SelectItem>
                            <SelectItem value="private">Приватная</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button size="icon" onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                        Сбросить
                    </Button>
                </div>

                {/* Grid */}
                {allPages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {allPages.map((page) => {
                            const sc = statusCfg(page.status);
                            return (
                                <Card key={page.id} className="group flex flex-col overflow-hidden">
                                    <CardContent className="flex-1 p-4">
                                        {/* Title row */}
                                        <div className="mb-2 flex items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-1">
                                                    {page.is_homepage && (
                                                        <Home className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                                                    )}
                                                    <span className="text-sm font-semibold leading-snug">
                                                        {page.title}
                                                    </span>
                                                </div>
                                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                                    /{page.slug}
                                                </span>
                                            </div>
                                            <span
                                                className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${sc.dot}`}
                                                title={sc.label}
                                            />
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge variant={sc.badge} className="text-xs">
                                                {sc.label}
                                            </Badge>
                                            {page.is_homepage && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Главная
                                                </Badge>
                                            )}
                                            {!page.is_public && (
                                                <Badge variant="outline" className="text-xs">
                                                    Скрытая
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Excerpt */}
                                        {page.excerpt && (
                                            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                                {page.excerpt}
                                            </p>
                                        )}
                                    </CardContent>

                                    <CardFooter className="flex items-center justify-between border-t px-4 py-2">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(page.created_at).toLocaleDateString('ru-RU', {
                                                day:   '2-digit',
                                                month: '2-digit',
                                                year:  '2-digit',
                                            })}
                                        </span>
                                        <div className="flex items-center gap-0.5">
                                            <Link href={`/dashboard/sites/${site.id}/pages/${page.id}`}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Просмотр">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Link href={`/dashboard/sites/${site.id}/pages/${page.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Редактировать">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 hover:text-destructive"
                                                title="Удалить"
                                                onClick={() => handleDelete(page.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">Страницы не найдены</h3>
                            <p className="mb-4 text-center text-sm text-muted-foreground">
                                {isFiltered
                                    ? 'По вашим критериям поиска страницы не найдены.'
                                    : 'У этого сайта пока нет страниц.'}
                            </p>
                            {!isFiltered && (
                                <Link href={`/dashboard/sites/${site.id}/pages/create`}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Создать страницу
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Load more */}
                {hasMore && (
                    <div className="flex flex-col items-center gap-1.5 pt-2">
                        <Button
                            variant="outline"
                            className="min-w-52"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Загружаем...
                                </>
                            ) : (
                                `Загрузить ещё (${pages.total - allPages.length})`
                            )}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Показано {allPages.length} из {pages.total}
                        </span>
                    </div>
                )}

                {/* All loaded hint */}
                {!hasMore && pages.total > pages.per_page && allPages.length > 0 && (
                    <p className="text-center text-xs text-muted-foreground">
                        Все {pages.total} страниц загружены
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
