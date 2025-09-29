import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Settings } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Настройки',
        href: '/dashboard/settings',
    },
];

export default function SettingsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Настройки" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex min-h-64 items-center justify-center">
                    <div className="text-center">
                        <Settings className="mx-auto h-12 w-12 text-gray-400" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                            Настройки
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Страница находится в разработке
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
