import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Globe, Plus, Settings } from 'lucide-react';

interface MainSiteManagementPageProps {
    mainSite?: {
        id: number;
        name: string;
        slug: string;
        status: string;
        is_public: boolean;
        updated_at: string;
    };
}

export default function MainSiteManagementPage({
    mainSite,
}: MainSiteManagementPageProps) {
    return (
        <AppLayout>
            <Head title="Управление главным сайтом" />

            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Главный сайт</h1>
                    <p className="mt-2 text-muted-foreground">
                        Управляйте главным сайтом через конструктор
                    </p>
                </div>

                {mainSite ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        {mainSite.name}
                                    </CardTitle>
                                    <CardDescription>
                                        Статус:{' '}
                                        {mainSite.is_public
                                            ? 'Опубликован'
                                            : 'Черновик'}{' '}
                                        • Обновлен:{' '}
                                        {new Date(
                                            mainSite.updated_at,
                                        ).toLocaleDateString('ru-RU')}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline">
                                        <Link
                                            href={`/sites/${mainSite.id}/preview`}
                                        >
                                            <Globe className="mr-2 h-4 w-4" />
                                            Просмотр
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/dashboard/main-site/builder">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Редактировать
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Главный сайт настроен и готов к использованию.
                                Используйте конструктор для редактирования.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Создать главный сайт
                            </CardTitle>
                            <CardDescription>
                                Главный сайт еще не создан. Создайте его с
                                помощью конструктора.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/sites/create?type=main">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Создать главный сайт
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
