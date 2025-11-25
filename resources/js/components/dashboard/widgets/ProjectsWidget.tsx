import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, DollarSign, ExternalLink } from 'lucide-react';
import React from 'react';

interface Project {
    id: number;
    title: string;
    description: string;
    image?: string;
    target_amount: number;
    current_amount: number;
    status: 'active' | 'completed' | 'paused';
    created_at: string;
    deadline?: string;
}

interface ProjectsWidgetProps {
    title?: string;
    projects?: Project[];
    limit?: number;
    columns?: number;
    showDescription?: boolean;
    showProgress?: boolean;
    showImage?: boolean;
    animation?: 'none' | 'fade' | 'slide' | 'zoom';
    hoverEffect?: 'none' | 'lift' | 'shadow' | 'scale';
    className?: string;
}

export const ProjectsWidget: React.FC<ProjectsWidgetProps> = ({
    title = 'Наши проекты',
    projects = [],
    limit = 6,
    columns = 3,
    showDescription = true,
    showProgress = true,
    showImage = true,
    animation = 'fade',
    hoverEffect = 'lift',
    className,
}) => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    const displayProjects = safeProjects.slice(0, limit);

    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    };

    const animationClasses = {
        none: '',
        fade: 'animate-fade-in',
        slide: 'animate-slide-up',
        zoom: 'animate-zoom-in',
    };

    const hoverClasses = {
        none: '',
        lift: 'hover:-translate-y-1',
        shadow: 'hover:shadow-xl',
        scale: 'hover:scale-105',
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Активный';
            case 'completed':
                return 'Завершен';
            case 'paused':
                return 'Приостановлен';
            default:
                return status;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const calculateProgress = (current: number, target: number) => {
        return Math.min((current / target) * 100, 100);
    };

    return (
        <section className={cn('py-8', className)}>
            <div className="container mx-auto">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
                    {title}
                </h2>

                <div
                    className={cn(
                        'grid gap-6',
                        gridCols[columns as keyof typeof gridCols] ||
                            'grid-cols-3',
                    )}
                >
                    {displayProjects.map((project) => (
                        <div
                            key={project.id}
                            className={cn(
                                'group rounded-lg border bg-white p-6 shadow-md transition-all duration-300',
                                animationClasses[animation],
                                hoverClasses[hoverEffect],
                            )}
                        >
                            {showImage && project.image && (
                                <div className="mb-4 overflow-hidden rounded-lg">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            )}

                            <div className="mb-4 flex items-start justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {project.title}
                                </h3>
                                <Badge
                                    className={cn(
                                        'ml-2 text-xs',
                                        getStatusColor(project.status),
                                    )}
                                >
                                    {getStatusText(project.status)}
                                </Badge>
                            </div>

                            {showDescription && project.description && (
                                <div
                                    className="mb-4 text-gray-600"
                                    // HTML в описании проекта задается администраторами,
                                    // поэтому мы считаем этот контент доверенным.
                                    dangerouslySetInnerHTML={{
                                        __html: project.description,
                                    }}
                                />
                            )}

                            {showProgress && (
                                <div className="mb-4">
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Собрано
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(
                                                project.current_amount,
                                            )}{' '}
                                            /{' '}
                                            {formatCurrency(
                                                project.target_amount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                        <div
                                            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                                            style={{
                                                width: `${calculateProgress(
                                                    project.current_amount,
                                                    project.target_amount,
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="mt-1 text-right text-xs text-gray-500">
                                        {calculateProgress(
                                            project.current_amount,
                                            project.target_amount,
                                        ).toFixed(1)}
                                        %
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        {new Date(
                                            project.created_at,
                                        ).toLocaleDateString('ru-RU')}
                                    </div>
                                    {project.deadline && (
                                        <div className="flex items-center">
                                            <DollarSign className="mr-1 h-4 w-4" />
                                            До{' '}
                                            {new Date(
                                                project.deadline,
                                            ).toLocaleDateString('ru-RU')}
                                        </div>
                                    )}
                                </div>
                                <Button size="sm" variant="outline">
                                    <ExternalLink className="mr-1 h-4 w-4" />
                                    Подробнее
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {safeProjects.length > limit && (
                    <div className="mt-8 text-center">
                        <Button variant="outline" size="lg">
                            Показать все проекты
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};
