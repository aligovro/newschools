import OrganizationCard from '@/components/organizations/OrganizationCard';
import { Link } from '@inertiajs/react';

interface OrganizationData {
    id: number;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    logo?: string;
    image?: string;
    region?: { name: string };
    city?: { id: number; name: string };
    type: string;
    projects_count: number;
    members_count?: number;
    sponsors_count?: number;
    donations_total: number;
    donations_collected: number;
    director_name?: string;
    latitude?: number | null;
    longitude?: number | null;
}

interface ListTabProps {
    organizations: {
        data: OrganizationData[];
        current_page: number;
        last_page: number;
    };
    filters?: {
        search?: string;
        region_id?: number;
        city_id?: number;
    };
    getPaginationUrl: (page: number) => string;
}

export default function ListTab({
    organizations,
    getPaginationUrl,
    filters,
}: ListTabProps) {
    return (
        <>
            {organizations.data.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {organizations.data.map((organization) => (
                        <OrganizationCard
                            key={organization.id}
                            organization={organization}
                        />
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
                            href={getPaginationUrl(
                                organizations.current_page - 1,
                            )}
                            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Предыдущая
                        </Link>
                    )}
                    {organizations.current_page < organizations.last_page && (
                        <Link
                            href={getPaginationUrl(
                                organizations.current_page + 1,
                            )}
                            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Следующая
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}
