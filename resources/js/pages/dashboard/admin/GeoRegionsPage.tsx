import RegionManagement from '@/components/dashboard/geo/RegionManagement';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Дашборд', href: '/dashboard' },
    { title: 'Управление регионами', href: '/dashboard/admin/geo/regions' },
];

interface PageProps {
    regions: any;
    filters: any;
    federalDistricts: any[];
}

const GeoRegionsPage: React.FC = () => {
    const { props } = usePage<PageProps>();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Управление регионами" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <RegionManagement
                    initialRegions={props.regions}
                    initialFilters={props.filters}
                    federalDistricts={props.federalDistricts}
                />
            </div>
        </AppLayout>
    );
};

export default GeoRegionsPage;
