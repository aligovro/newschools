import React from 'react';
import { Project, ProjectsOutputConfig, WidgetOutputProps } from './types';

export const ProjectsOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as ProjectsOutputConfig;

    const {
        title = '',
        projects = [],
        limit = 0,
        columns = 3,
        showDescription = true,
        showProgress = true,
        showImage = true,
        animation = 'none',
        hoverEffect = 'lift',
    } = config;

    const displayProjects = limit > 0 ? projects.slice(0, limit) : projects;

    if (!projects || projects.length === 0) {
        return (
            <div
                className={`projects-output projects-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">Проекты не настроены</span>
                </div>
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
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                        {project.title}
                    </h3>

                    {showDescription && project.description && (
                        <p className="mb-4 line-clamp-3 text-gray-600">
                            {project.description}
                        </p>
                    )}

                    {showProgress && typeof project.progress === 'number' && (
                        <div className="mb-4">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-gray-600">Прогресс</span>
                                <span className="font-medium text-gray-900">
                                    {project.progress}%
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                                <div
                                    className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${project.progress}%` }}
                                />
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

                    {project.link && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                            Подробнее
                            <svg
                                className="ml-1 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`projects-output ${className || ''}`} style={style}>
            {title && (
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
                    {title}
                </h2>
            )}
            <div className={`grid gap-6 ${getGridClasses(columns)}`}>
                {displayProjects.map((project, index) =>
                    renderProject(project, index),
                )}
            </div>
        </div>
    );
};
