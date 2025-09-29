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
import { Globe, Plus, Settings } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
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
    organization: {
        id: number;
        name: string;
    };
}

interface SiteManagementPageProps {
    sites: {
        data: Site[];
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

export default function SiteManagementPage({
    sites,
    filters,
}: SiteManagementPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Управление сайтами" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Управление сайтами
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Управление доменами и сайтами организаций
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/sites/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Создать сайт
                        </Link>
                    </Button>
                </div>

                {sites.data.length === 0 ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <div className="text-center">
                            <Globe className="mx-auto h-12 w-12 text-gray-400" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                                Нет сайтов
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Создайте первый сайт для организации
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sites.data.map((site) => (
                            <Card key={site.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">
                                            {site.domain}
                                        </CardTitle>
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
                                    <CardDescription>
                                        {site.organization.name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {site.custom_domain && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Кастомный домен:{' '}
                                                {site.custom_domain}
                                            </p>
                                        )}
                                        {site.subdomain && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Поддомен: {site.subdomain}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                SSL:{' '}
                                                {site.is_ssl_enabled
                                                    ? 'Включен'
                                                    : 'Отключен'}
                                            </span>
                                            {site.is_primary && (
                                                <Badge variant="outline">
                                                    Основной
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/dashboard/sites/${site.id}`}
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                Настройки
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
