import ProjectCard from '@/components/projects/ProjectCard';
import MainSiteLayout from '@/layouts/MainSiteLayout';
import { Link } from '@inertiajs/react';

interface Organization {
    name: string;
    slug: string;
    region?: {
        name: string;
    };
}

interface Project {
    id: number;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    target_amount_rubles: number;
    collected_amount_rubles: number;
    progress_percentage: number;
    organization?: Organization;
}

interface ProjectsPageProps {
    site: any;
    positions: any[];
    projects: {
        data: Project[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        category?: string;
    };
}

export default function Projects({
    site,
    positions,
    projects,
    filters,
}: ProjectsPageProps) {
    return (
        <MainSiteLayout
            site={site}
            positions={positions}
            pageTitle="Проекты"
            pageDescription="Список всех проектов"
        >
            <div className="space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Проекты
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Список всех активных проектов
                    </p>
                </div>

                {projects.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.data.map((project) => (
                            <Link
                                key={project.id}
                                href={`/project/${project.slug}`}
                            >
                                <ProjectCard project={project} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-gray-500">Проекты не найдены</p>
                    </div>
                )}

                {projects.last_page > 1 && (
                    <div className="flex justify-center space-x-2">
                        {projects.current_page > 1 && (
                            <Link
                                href={`/projects?page=${projects.current_page - 1}`}
                                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Предыдущая
                            </Link>
                        )}
                        {projects.current_page < projects.last_page && (
                            <Link
                                href={`/projects?page=${projects.current_page + 1}`}
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
