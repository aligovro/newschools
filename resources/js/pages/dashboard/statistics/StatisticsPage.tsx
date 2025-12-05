import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Админ панель',
        href: dashboard().url,
    },
    {
        title: 'Статистика',
        href: '/dashboard/statistics',
    },
];

export default function StatisticsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Статистика" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex min-h-64 items-center justify-center">
                    <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-900">
                            Статистика
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Страница находится в разработке
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
