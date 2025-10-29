import OrganizationCard from '@/components/OrganizationCard';
import MainSiteLayout from '@/layouts/MainSiteLayout';
import { Link } from '@inertiajs/react';

interface OrganizationData {
    id: number;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    logo?: string;
    image?: string;
    region?: {
        name: string;
    };
    type: string;
    projects_count: number;
    donations_total: number;
    donations_collected: number;
}

interface OrganizationsPageProps {
    site: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        favicon?: string;
        template: string;
        widgets_config: any[];
        seo_config?: Record<string, unknown>;
    };
    positions: any[];
    organizations: {
        data: OrganizationData[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        region_id?: number;
    };
}

export default function Organizations({
    site,
    positions,
    organizations,
}: OrganizationsPageProps) {
    return (
        <MainSiteLayout
            site={site}
            positions={positions}
            pageTitle="Организации"
            pageDescription="Список всех организаций"
        >
            <div className="space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Организации
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Список всех активных организаций
                    </p>
                </div>

                {organizations.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {organizations.data.map((organization) => (
                            <div key={organization.id}>
                                <OrganizationCard organization={organization} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-gray-500">Организации не найдены</p>
                    </div>
                )}

                {organizations.last_page > 1 && (
                    <div className="flex justify-center space-x-2">
                        {organizations.current_page > 1 && (
                            <Link
                                href={`/organizations?page=${organizations.current_page - 1}`}
                                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Предыдущая
                            </Link>
                        )}
                        {organizations.current_page <
                            organizations.last_page && (
                            <Link
                                href={`/organizations?page=${organizations.current_page + 1}`}
                                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Следующая
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </MainSiteLayout>
    );
}
