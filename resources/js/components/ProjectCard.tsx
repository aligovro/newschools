import { Link } from '@inertiajs/react';

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

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <Link href={`/projects/${project.id}`} className="block">
                {/* Project Image */}
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
                    {project.image ? (
                        <img
                            src={project.image}
                            alt={project.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center text-2xl font-bold text-white">
                                {project.title.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>

                <div className="p-6">
                    {/* Project Info */}
                    <div className="mb-4">
                        <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900">
                            {project.title}
                        </h3>
                        {project.description && (
                            <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                                {project.description}
                            </p>
                        )}
                        <div className="text-sm text-gray-500">
                            {project.organization_name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {project.organization_address}
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-4">
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="text-gray-600">Необходимо</span>
                            <span className="text-gray-600">Собрали</span>
                        </div>
                        <div className="mb-2 flex justify-between font-semibold">
                            <span className="text-gray-900">
                                {formatCurrency(project.target_amount)}
                            </span>
                            <span className="text-green-600">
                                {formatCurrency(project.collected_amount)}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                                className="h-2 rounded-full bg-green-600 transition-all duration-300"
                                style={{
                                    width: `${Math.min(project.progress_percentage, 100)}%`,
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                        <button className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700">
                            Поддержать
                        </button>
                        <div className="text-sm text-gray-500">
                            {project.progress_percentage}%
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
