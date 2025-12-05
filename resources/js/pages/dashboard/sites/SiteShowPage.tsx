import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Globe, Settings, Shield } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Админ панель',
        href: dashboard().url,
    },
    {
        title: 'Сайты',
        href: '/dashboard/sites',
    },
];

interface Site {
    id: number;
    domain: string;
    custom_domain?: string;
    subdomain?: string;
    is_primary: boolean;
    is_ssl_enabled: boolean;
    status: string;
    verified_at?: string;
    expires_at?: string;
    ssl_config?: any;
    dns_records?: any;
    organization: {
        id: number;
        name: string;
    };
}

interface SiteShowPageProps {
    site: Site;
}

export default function SiteShowPage({ site }: SiteShowPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Сайт: ${site.domain}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/sites">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад к списку
                            </Link>
                        </Button>
                        <div>
                            <h1 className="block__title">
                                {site.domain}
                            </h1>
                            <p className="text-gray-600">
                                {site.organization.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/dashboard/sites/${site.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/dashboard/sites/${site.id}/settings`}>
                                <Settings className="mr-2 h-4 w-4" />
                                Настройки
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Основная информация */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Основная информация
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    Домен
                                </label>
                                <p className="text-sm text-gray-900">
                                    {site.domain}
                                </p>
                            </div>
                            {site.custom_domain && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        Кастомный домен
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {site.custom_domain}
                                    </p>
                                </div>
                            )}
                            {site.subdomain && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        Поддомен
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {site.subdomain}
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    Статус
                                </label>
                                <div className="mt-1">
                                    <Badge
                                        variant={
                                            site.status === 'active'
                                                ? 'default'
                                                : site.status === 'inactive'
                                                  ? 'secondary'
                                                  : 'destructive'
                                        }
                                    >
                                        {site.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SSL и безопасность */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                SSL и безопасность
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    SSL сертификат
                                </label>
                                <div className="mt-1">
                                    <Badge
                                        variant={
                                            site.is_ssl_enabled
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {site.is_ssl_enabled
                                            ? 'Включен'
                                            : 'Отключен'}
                                    </Badge>
                                </div>
                            </div>
                            {site.verified_at && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        Проверен
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(
                                            site.verified_at,
                                        ).toLocaleDateString('ru-RU')}
                                    </p>
                                </div>
                            )}
                            {site.expires_at && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        Истекает
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(
                                            site.expires_at,
                                        ).toLocaleDateString('ru-RU')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Дополнительные настройки */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Дополнительные настройки</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    Основной домен
                                </label>
                                <div className="mt-1">
                                    <Badge
                                        variant={
                                            site.is_primary
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {site.is_primary ? 'Да' : 'Нет'}
                                    </Badge>
                                </div>
                            </div>
                            {site.ssl_config && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        SSL конфигурация
                                    </label>
                                    <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                                        {JSON.stringify(
                                            site.ssl_config,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* DNS записи */}
                {site.dns_records && (
                    <Card>
                        <CardHeader>
                            <CardTitle>DNS записи</CardTitle>
                            <CardDescription>
                                Настройки DNS для домена
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="rounded bg-gray-100 p-4 text-sm">
                                {JSON.stringify(site.dns_records, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
