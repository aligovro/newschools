import OrganizationForm from '@/components/organizations/OrganizationForm';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Организации', href: '/dashboard/organizations' },
    { title: 'Создать организацию', href: '/dashboard/organizations/create' },
];

interface OrganizationType {
    value: string;
    label: string;
    description: string;
}

interface Props {
    referenceData: {
        organizationTypes: OrganizationType[];
        regions: any[];
        availableUsers: any[];
    };
}

export default function CreateOrganization({ referenceData }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создать организацию" />
            <div className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                        >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                        </Button>
                        <div>
                        <h1 className="text-xl font-semibold">
                                Создать организацию
                            </h1>
                        <p className="text-sm text-muted-foreground">
                            Зарегистрировать новую организацию
                            </p>
                    </div>
                </div>
                <OrganizationForm
                    mode="create"
                    referenceData={referenceData as any}
                />
            </div>
        </AppLayout>
    );
}
