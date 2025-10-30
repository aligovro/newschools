import ProjectCard from '@/components/ProjectCard';
import MainSiteLayout from '@/layouts/MainSiteLayout';
import { Link } from '@inertiajs/react';

interface Project {
    id: number;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    target_amount_rubles: number;
    collected_amount_rubles: number;
    progress_percentage: number;
}

interface Organization {
    id: number;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    region?: {
        name: string;
    };
    city?: {
        name: string;
    };
    type: string;
    projects?: Project[];
}

interface OrganizationShowProps {
    site: any;
    positions: any[];
    organization: Organization;
}

export default function OrganizationShow({
    site,
    positions,
    organization,
}: OrganizationShowProps) {
    return (
        <MainSiteLayout
            site={site}
            positions={positions}
            pageTitle={organization.name}
            pageDescription={organization.description}
        >
            <div className="space-y-8">
                <div className="rounded-lg bg-white shadow-sm">
                    <div className="p-8">
                        <div className="flex items-start space-x-6">
                            {organization.logo && (
                                <img
                                    src={organization.logo}
                                    alt={organization.name}
                                    className="h-32 w-32 rounded-lg object-cover shadow-md"
                                />
                            )}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {organization.name}
                                </h1>
                                {organization.description && (
                                    <p className="mt-2 text-gray-600">
                                        {organization.description}
                                    </p>
                                )}
                                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                                    {organization.region && (
                                        <span>{organization.region.name}</span>
                                    )}
                                    {organization.city && (
                                        <span>г. {organization.city.name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {organization.projects && organization.projects.length > 0 && (
                    <div>
                        <h2 className="mb-6 text-2xl font-bold text-gray-900">
                            Проекты
                        </h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {organization.projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/project/${project.slug}`}
                                >
                                    <ProjectCard project={project} />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainSiteLayout>
    );
}
