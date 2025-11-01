import MainLayout from '@/layouts/MainLayout';
import { Link } from '@inertiajs/react';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface ProjectStage {
    id: number;
    title: string;
    description?: string;
    image?: string;
    gallery?: string[];
    target_amount_rubles: number;
    collected_amount_rubles: number;
    progress_percentage: number;
    formatted_target_amount: string;
    formatted_collected_amount: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    is_completed: boolean;
    is_active: boolean;
    is_pending: boolean;
    start_date?: string;
    end_date?: string;
    order: number;
}

interface Project {
    id: number;
    title: string;
    slug: string;
    description?: string;
    short_description?: string;
    image?: string;
    gallery?: string[];
    target_amount_rubles: number;
    collected_amount_rubles: number;
    progress_percentage: number;
    has_stages?: boolean;
    stages?: ProjectStage[];
    category?: string;
    start_date?: string;
    end_date?: string;
    beneficiaries?: any[];
    progress_updates?: any[];
    organization?: Organization;
}

interface ProjectShowProps {
    site: any;
    positions: any[];
    position_settings?: any[];
    project: Project;
}

export default function ProjectShow({
    site,
    positions,
    position_settings = [],
    project,
}: ProjectShowProps) {
    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle={project.title}
            pageDescription={project.short_description}
        >
            <div className="space-y-8">
                <article className="rounded-lg bg-white shadow-sm">
                    <div className="p-8">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {project.title}
                            </h1>
                            {project.organization && (
                                <p className="mt-2 text-gray-600">
                                    <Link
                                        href={`/organization/${project.organization.slug}`}
                                        className="hover:text-blue-600"
                                    >
                                        {project.organization.name}
                                    </Link>
                                </p>
                            )}
                        </div>

                        {project.image && (
                            <div className="mb-6">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="h-64 w-full rounded-lg object-cover"
                                />
                            </div>
                        )}

                        {project.description && (
                            <div
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: project.description,
                                }}
                            />
                        )}

                        <div className="mt-8 rounded-lg bg-gray-50 p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Прогресс сбора
                            </h3>
                            <div className="mb-2 flex justify-between text-sm text-gray-600">
                                <span>Собрано</span>
                                <span className="font-semibold text-gray-900">
                                    {project.formatted_collected_amount ||
                                        new Intl.NumberFormat('ru-RU', {
                                            style: 'currency',
                                            currency: 'RUB',
                                            minimumFractionDigits: 0,
                                        }).format(
                                            project.collected_amount_rubles,
                                        )}
                                </span>
                            </div>
                            <div className="mb-4">
                                <div className="h-4 w-full rounded-full bg-gray-200">
                                    <div
                                        className="h-4 rounded-full bg-green-500"
                                        style={{
                                            width: `${project.progress_percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Цель</span>
                                <span className="font-semibold text-gray-900">
                                    {project.formatted_target_amount ||
                                        new Intl.NumberFormat('ru-RU', {
                                            style: 'currency',
                                            currency: 'RUB',
                                            minimumFractionDigits: 0,
                                        }).format(project.target_amount_rubles)}
                                </span>
                            </div>
                            <div className="mt-4">
                                <a
                                    href="#donate"
                                    className="btn-accent inline-flex items-center justify-center rounded-lg px-6 py-3 text-white"
                                >
                                    Помочь проекту
                                </a>
                            </div>
                        </div>

                        {project.gallery && project.gallery.length > 0 && (
                            <div className="mt-8">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                    Галерея
                                </h3>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                    {project.gallery.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`${project.title} - ${index + 1}`}
                                            className="rounded-lg object-cover"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.has_stages &&
                            project.stages &&
                            project.stages.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="mb-6 text-xl font-semibold text-gray-900">
                                        Этапы проекта
                                    </h3>
                                    <div className="space-y-6">
                                        {project.stages.map((stage, index) => {
                                            const getStatusColor = () => {
                                                if (stage.is_completed)
                                                    return 'bg-green-100 text-green-800 border-green-300';
                                                if (stage.is_active)
                                                    return 'bg-blue-100 text-blue-800 border-blue-300';
                                                return 'bg-gray-100 text-gray-800 border-gray-300';
                                            };
                                            const getStatusLabel = () => {
                                                if (stage.is_completed)
                                                    return 'Завершен';
                                                if (stage.is_active)
                                                    return 'Активен';
                                                return 'Ожидает';
                                            };

                                            return (
                                                <div
                                                    key={stage.id}
                                                    className="rounded-lg border p-6"
                                                >
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            {index + 1} этап
                                                            проекта:{' '}
                                                            {stage.title}
                                                        </h4>
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor()}`}
                                                        >
                                                            {getStatusLabel()}
                                                        </span>
                                                    </div>

                                                    {stage.image && (
                                                        <div className="mb-4">
                                                            <img
                                                                src={
                                                                    stage.image
                                                                }
                                                                alt={
                                                                    stage.title
                                                                }
                                                                className="h-48 w-full rounded-lg object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    {stage.description && (
                                                        <div
                                                            className="prose prose-sm mb-4 max-w-none"
                                                            dangerouslySetInnerHTML={{
                                                                __html: stage.description,
                                                            }}
                                                        />
                                                    )}

                                                    {stage.gallery &&
                                                        stage.gallery.length >
                                                            0 && (
                                                            <div className="mb-4">
                                                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                                                    {stage.gallery.map(
                                                                        (
                                                                            img,
                                                                            imgIndex,
                                                                        ) => (
                                                                            <img
                                                                                key={
                                                                                    imgIndex
                                                                                }
                                                                                src={
                                                                                    img
                                                                                }
                                                                                alt={`${stage.title} - ${imgIndex + 1}`}
                                                                                className="h-24 w-full rounded-lg object-cover"
                                                                            />
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    <div className="rounded-lg bg-gray-50 p-4">
                                                        <div className="mb-2 flex justify-between text-sm text-gray-600">
                                                            <span>Собрано</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {
                                                                    stage.formatted_collected_amount
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="mb-4">
                                                            <div className="h-3 w-full rounded-full bg-gray-200">
                                                                <div
                                                                    className="h-3 rounded-full bg-green-500"
                                                                    style={{
                                                                        width: `${stage.progress_percentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between text-sm text-gray-600">
                                                            <span>Цель</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {
                                                                    stage.formatted_target_amount
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                    </div>
                </article>
            </div>
        </MainLayout>
    );
}
