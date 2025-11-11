import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { NewsItem } from '@/lib/api/news';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';

interface ContextPayload {
    mode: 'global' | 'organization';
    organization: {
        id: number;
        name: string;
        slug: string;
    } | null;
}

interface NewsShowProps {
    context: ContextPayload;
    news: {
        data: NewsItem;
    };
    permissions: {
        canManage: boolean;
    };
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

export default function NewsShow({ context, news, permissions }: NewsShowProps) {
    const item = news.data;

    const breadcrumbs = useMemo(() => {
        const crumbs = [
            { title: 'Админ панель', href: '/dashboard' },
        ];

        if (context.mode === 'organization' && context.organization) {
            crumbs.push(
                { title: 'Школы', href: '/dashboard/organizations' },
                {
                    title: context.organization.name,
                    href: `/dashboard/organizations/${context.organization.id}`,
                },
            );
        }

        crumbs.push({
            title: 'События и новости',
            href:
                context.mode === 'global'
                    ? '/dashboard/news'
                    : `/dashboard/organizations/${context.organization?.id}/news`,
        });

        crumbs.push({
            title: item.title,
            href: '#',
        });

        return crumbs;
    }, [context, item.title]);

    const backPath =
        context.mode === 'global'
            ? '/dashboard/news'
            : `/dashboard/organizations/${context.organization?.id}/news`;

    const editPath =
        context.mode === 'global'
            ? `/dashboard/news/${item.id}/edit`
            : `/dashboard/organizations/${context.organization?.id}/news/${item.id}/edit`;

    const statusColor =
        statusColors[item.status] ?? 'bg-slate-500 text-white';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={item.title} />

            <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {item.title}
                        </h1>
                        {item.subtitle && (
                            <p className="text-gray-600">{item.subtitle}</p>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={backPath}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад к списку
                            </Link>
                        </Button>

                        {permissions.canManage && (
                            <Button asChild>
                                <Link href={editPath}>Редактировать</Link>
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Основная информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-gray-700">
                        <div className="flex flex-wrap gap-3">
                            <Badge className={statusColor}>
                                {item.status_label}
                            </Badge>
                            <Badge variant="secondary">
                                {visibilityLabels[item.visibility] ??
                                    item.visibility_label}
                            </Badge>
                            <Badge variant="outline">{item.type}</Badge>
                            {item.is_featured && (
                                <Badge variant="default">Избранное</Badge>
                            )}
                        </div>

                        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <dt className="font-medium text-gray-500">
                                    Организация
                                </dt>
                                <dd>
                                    {item.organization?.name ??
                                        context.organization?.name ??
                                        '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">
                                    Период
                                </dt>
                                <dd>
                                    {item.starts_at
                                        ? format(
                                              new Date(item.starts_at),
                                              'dd.MM.yyyy HH:mm',
                                          )
                                        : 'Не указано'}
                                    {' — '}
                                    {item.ends_at
                                        ? format(
                                              new Date(item.ends_at),
                                              'dd.MM.yyyy HH:mm',
                                          )
                                        : 'Не указано'}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">
                                    Локация
                                </dt>
                                <dd>
                                    {item.location?.name || '—'}
                                    {item.location?.address && (
                                        <>
                                            <br />
                                            <span className="text-gray-500">
                                                {item.location.address}
                                            </span>
                                        </>
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">
                                    Регистрация
                                </dt>
                                <dd className="space-y-1">
                                    <div>
                                        {item.registration_required
                                            ? 'Требуется'
                                            : 'Не требуется'}
                                    </div>
                                    {item.registration_url && (
                                        <a
                                            href={item.registration_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {item.registration_url}
                                        </a>
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">
                                    Привязка
                                </dt>
                                <dd>
                                    {item.target
                                        ? `${item.target.name ?? item.target.type} (#${item.target.id})`
                                        : 'Не задано'}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-500">
                                    Обновлено
                                </dt>
                                <dd>
                                    {item.updated_at
                                        ? format(
                                              new Date(item.updated_at),
                                              'dd.MM.yyyy HH:mm',
                                          )
                                        : '—'}
                                </dd>
                            </div>
                        </dl>

                        {item.tags.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-500">
                                    Теги
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {item.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.excerpt && (
                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-500">
                                    Краткое описание
                                </h3>
                                <p>{item.excerpt}</p>
                            </div>
                        )}

                        {item.content && (
                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-500">
                                    Контент
                                </h3>
                                <div className="prose max-w-none whitespace-pre-wrap">
                                    {item.content}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {(item.image || item.gallery.length > 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Изображения</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {item.image && (
                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-500">
                                        Основное изображение
                                    </h4>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="max-h-96 rounded-md object-cover"
                                    />
                                </div>
                            )}

                            {item.gallery.length > 0 && (
                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-500">
                                        Галерея
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        {item.gallery.map((image) => (
                                            <img
                                                key={image}
                                                src={image}
                                                alt=""
                                                className="h-48 rounded-md object-cover"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

