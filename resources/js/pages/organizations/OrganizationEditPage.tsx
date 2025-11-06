import OrganizationForm from '@/components/dashboard/pages/organizations/OrganizationForm';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Админ панель',
        href: dashboard().url,
    },
    {
        title: 'Организации',
        href: '/dashboard/organizations',
    },
    {
        title: 'Редактирование',
        href: '#',
    },
];

interface Region {
    id: number;
    name: string;
    code: string;
}

interface City {
    id: number;
    name: string;
    region_id: number;
}

interface Settlement {
    id: number;
    name: string;
    city_id: number;
}

interface Organization {
    id: number;
    name: string;
    slug: string;
    description?: string;
    type: string;
    status: 'active' | 'inactive' | 'pending';
    is_public: boolean;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    logo?: string;
    founded_at?: string;
    region?: Region;
    city?: City;
    settlement?: Settlement;
}

interface Props {
    organization: Organization;
    referenceData: {
        organizationTypes: Array<{
            value: string;
            label: string;
            description: string;
        }>;
        regions: Region[];
        cities: City[];
        settlements: Settlement[];
    };
    organizationSettings?: any;
}

export default function OrganizationEditPage({
    organization,
    referenceData,
    organizationSettings,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактировать ${organization.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard/organizations">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Редактировать организацию
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Изменить данные организации
                            </p>
                        </div>
                    </div>
                </div>

                <OrganizationForm
                    mode="edit"
                    organization={organization as any}
                    referenceData={referenceData as any}
                    organizationSettings={organizationSettings as any}
                />
            </div>
        </AppLayout>
    );
}
