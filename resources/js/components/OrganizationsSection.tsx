import { Link } from '@inertiajs/react';
import OrganizationCard from './OrganizationCard';

interface Organization {
    id: number;
    name: string;
    description: string;
    address: string;
    image?: string;
    projects_count: number;
    donations_total: number;
    donations_collected: number;
}

interface Terminology {
    site_name: string;
    site_description: string;
    org_plural: string;
    org_genitive: string;
    support_action: string;
}

interface OrganizationsSectionProps {
    organizations: Organization[];
    terminology: Terminology;
}

export default function OrganizationsSection({
    organizations,
    terminology,
}: OrganizationsSectionProps) {
    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                        {terminology.org_plural} города
                    </h2>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600">
                        Выберите {terminology.org_plural.toLowerCase()}, которую
                        хотите поддержать
                    </p>
                </div>

                {/* Organizations Grid */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {organizations.map((organization) => (
                        <OrganizationCard
                            key={organization.id}
                            organization={organization}
                        />
                    ))}
                </div>

                {/* Load More Button */}
                <div className="text-center">
                    <button className="rounded-lg border-2 border-blue-600 bg-white px-8 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50">
                        Загрузить больше
                    </button>
                </div>

                {/* View All Button */}
                <div className="mt-6 text-center">
                    <Link
                        href="/organizations"
                        className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700"
                    >
                        Все {terminology.org_plural.toLowerCase()}
                        <svg
                            className="ml-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
