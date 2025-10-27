import { Link } from '@inertiajs/react';
import ProjectCard from './ProjectCard';

interface Project {
    id: number;
    title: string;
    description: string;
    target_amount: number;
    collected_amount: number;
    progress_percentage: number;
    organization_name: string;
    organization_address: string;
    image?: string;
}

interface Terminology {
    organization?: {
        plural_nominative: string;
        plural_genitive: string;
    };
}

interface ProjectsSectionProps {
    projects: Project[];
    terminology: Terminology;
}

export default function ProjectsSection({
    projects,
    terminology,
}: ProjectsSectionProps) {
    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                            Проекты{' '}
                            {terminology.organization?.plural_genitive ||
                                'организаций'}
                        </h2>
                        <p className="max-w-2xl text-xl text-gray-600">
                            Активные проекты, требующие поддержки
                        </p>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <Link
                            href="/projects"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            Все проекты
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

                {/* Projects Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>

                {/* Empty State */}
                {projects.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                            <svg
                                className="h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">
                            Пока нет активных проектов
                        </h3>
                        <p className="mb-6 text-gray-600">
                            Новые проекты появятся здесь, когда{' '}
                            {terminology.organization?.plural_nominative?.toLowerCase() ||
                                'организации'}{' '}
                            их создадут
                        </p>
                        <Link
                            href="/projects/create"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            Создать проект
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
