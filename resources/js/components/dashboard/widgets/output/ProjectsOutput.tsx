import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Project, ProjectsOutputConfig, WidgetOutputProps } from './types';

export const ProjectsOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as ProjectsOutputConfig;

    const {
        title = '',
        show_title = true, // По умолчанию true для обратной совместимости
        projects = [],
        limit = 0,
        columns = 3,
        showDescription = true,
        showProgress = true,
        showImage = true,
        animation = 'none',
        hoverEffect = 'lift',
        organization_id,
        showHeaderActions = false,
    } = config as any;

    // Локальная подгрузка проектов, если их не передали конфигом
    const [fetched, setFetched] = useState<Project[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const providedProjects =
        projects && projects.length > 0 ? projects : fetched || [];
    const displayProjects =
        limit > 0 ? providedProjects.slice(0, limit) : providedProjects;

    useEffect(() => {
        if (projects && projects.length > 0) return; // данные уже есть
        const controller = new AbortController();
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const params = new URLSearchParams();
                if (typeof (config as any).organization_id === 'number') {
                    params.append(
                        'organization_id',
                        String((config as any).organization_id),
                    );
                }
                if (limit && limit > 0) {
                    params.append('limit', String(limit));
                }
                const res = await fetch(
                    `/api/public/projects/latest?${params.toString()}`,
                    { signal: controller.signal },
                );
                if (!res.ok) throw new Error('Failed to load projects');
                const json = await res.json();
                setFetched((json?.data || []) as Project[]);
            } catch (e: any) {
                if (e?.name !== 'AbortError')
                    setError(e?.message || 'Failed to load projects');
            } finally {
                setLoading(false);
            }
        };
        run();
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit, (config as any).organization_id]);

    if (!providedProjects || providedProjects.length === 0) {
        return (
            <div
                className={`projects-output projects-output--empty ${className || ''}`}
                style={style}
            >
                {loading ? (
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <span className="text-gray-500">
                            Загрузка проектов…
                        </span>
                    </div>
                ) : (
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <span className="text-gray-500">
                            Проекты не настроены
                        </span>
                    </div>
                )}
            </div>
        );
    }

    const getGridClasses = (columns: number) => {
        switch (columns) {
            case 1:
                return 'grid-cols-1';
            case 2:
                return 'grid-cols-1 md:grid-cols-2';
            case 3:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            default:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    };

    const getHoverClasses = (effect: string) => {
        switch (effect) {
            case 'lift':
                return 'hover:-translate-y-1';
            case 'shadow':
                return 'hover:shadow-lg';
            case 'scale':
                return 'hover:scale-105';
            case 'none':
            default:
                return '';
        }
    };

    const getAnimationClasses = (animation: string) => {
        switch (animation) {
            case 'fade':
                return 'animate-fade-in';
            case 'slide':
                return 'animate-slide-up';
            case 'zoom':
                return 'animate-zoom-in';
            default:
                return '';
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
        }).format(amount);

    const renderProject = (project: Project, index: number) => {
        const safeImage =
            project.image && !project.image.startsWith('blob:')
                ? project.image
                : '';

        return (
            <div
                key={project.id}
                className={`project-card group rounded-lg bg-white shadow-md transition-all duration-300 ${getHoverClasses(hoverEffect)} ${getAnimationClasses(animation)}`}
                style={{ animationDelay: `${index * 100}ms` }}
            >
                {showImage && safeImage && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                            src={safeImage}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    </div>
                )}

                <div className="p-6">
                    {/** Короткое описание в одну строку */}
                    {(project as any).short_description && (
                        <p className="mb-1 line-clamp-1 text-sm text-gray-600">
                            {(project as any).short_description}
                        </p>
                    )}
                    {/** Заголовок проекта */}
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                        {project.title}
                    </h3>

                    {showDescription && project.description && (
                        <p className="mb-4 line-clamp-3 text-gray-600">
                            {project.description}
                        </p>
                    )}

                    {showProgress && (
                        <div className="mb-4">
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Необходимо
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(
                                        (project as any).target_amount ?? 0,
                                    )}
                                </span>
                            </div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-gray-600">Собрали</span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(
                                        (project as any).current_amount ?? 0,
                                    )}
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                                <div
                                    className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                                    style={{
                                        width: `${Math.min(
                                            (((project as any).current_amount ??
                                                0) /
                                                Math.max(
                                                    1,
                                                    (project as any)
                                                        .target_amount ?? 1,
                                                )) *
                                                100,
                                            100,
                                        ).toFixed(2)}%`,
                                    }}
                                />
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                                <span>
                                    {formatCurrency(
                                        (project as any).target_amount ?? 0,
                                    )}
                                </span>
                                <span>
                                    {formatCurrency(
                                        (project as any).current_amount ?? 0,
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    {project.status && (
                        <div className="mb-4">
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    project.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : project.status === 'in-progress'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {project.status === 'completed'
                                    ? 'Завершен'
                                    : project.status === 'in-progress'
                                      ? 'В процессе'
                                      : project.status}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {(project as any).organization_name}
                        </div>
                        <Link
                            href={
                                (project as any).slug
                                    ? `/project/${(project as any).slug}`
                                    : (project as any).link || '#'
                            }
                            className="inline-flex items-center rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Помочь
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`projects-output ${className || ''}`} style={style}>
            {((title && show_title) || (config as any).showHeaderActions) && (
                <div className="mb-6 flex items-center justify-between">
                    {title && show_title && (
                    <h2 className="text-2xl font-bold text-gray-900">
                            {title}
                    </h2>
                    )}
                    {showHeaderActions && (
                        <Link
                            href={
                                organization_id
                                    ? `/organizations/${organization_id}/projects`
                                    : '/projects'
                            }
                            className="btn-outline-primary dark-color"
                        >
                            Все проекты
                        </Link>
                    )}
                </div>
            )}
            <div className={`grid gap-6 ${getGridClasses(columns)}`}>
                {displayProjects.map((project: any, index: number) =>
                    renderProject(project, index),
                )}
            </div>
        </div>
    );
};
