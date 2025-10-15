import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { adminApi } from '@/lib/api/index';
import { Head, Link, useForm } from '@inertiajs/react';

interface GlobalSettingsPageProps {
    settings: any;
    terminology: any;
    system: any;
}

export default function GlobalSettingsPage({
    settings,
    terminology,
    system,
}: GlobalSettingsPageProps) {
    const { processing, post } = useForm({});

    return (
        <AppLayout>
            <Head title="Глобальные настройки" />
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Терминология</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Управляйте падежами и формами терминов системы
                        </div>
                        <Button asChild>
                            <Link href="/settings/terminology">Перейти</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Системные настройки</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                            Имя системы: {system.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Язык: {system.language}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Часовой пояс: {system.timezone}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                disabled={processing}
                                onClick={async () => {
                                    try {
                                        await adminApi.clearCache();
                                        window.location.reload();
                                    } catch (error) {
                                        console.error(
                                            'Error clearing cache:',
                                            error,
                                        );
                                    }
                                }}
                            >
                                Очистить кеш
                            </Button>
                            <Button asChild variant="outline">
                                <a
                                    href="/dashboard/admin/global-settings/export"
                                    target="_blank"
                                >
                                    Экспорт
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
