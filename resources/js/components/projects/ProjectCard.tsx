import '@css/components/projects/project-card.scss';
import { Link, router } from '@inertiajs/react';

import type { MoneyAmount } from '@/types/money';

interface FundingSummary {
    target: MoneyAmount;
    collected: MoneyAmount;
    progress_percentage: number;
}

interface Project {
    id: number;
    title: string;
    slug?: string;
    description?: string;
    funding?: FundingSummary;
    target_amount_rubles?: number;
    target_amount?: number;
    collected_amount_rubles?: number;
    collected_amount?: number;
    progress_percentage: number;
    organization?: {
        name: string;
        slug?: string;
    };
    organization_name?: string;
    organization_address?: string;
    image?: string;
}

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const formatCurrency = (amount: number): string =>
        new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

    const targetAmount =
        project.funding?.target.value ??
        project.target_amount_rubles ??
        project.target_amount ??
        0;
    const collectedAmount =
        project.funding?.collected.value ??
        project.collected_amount_rubles ??
        project.collected_amount ??
        0;
    const projectUrl = project.slug
        ? `/project/${project.slug}`
        : `/project/${project.id}`;
    const organizationName =
        project.organization?.name ?? project.organization_name ?? '';
    const organizationSlug = project.organization?.slug;
    const organizationUrl = organizationSlug
        ? `/organization/${organizationSlug}`
        : null;

    const progressPercentage = Math.min(
        project.funding?.progress_percentage ?? project.progress_percentage,
        100,
    );

    const targetDisplay =
        project.funding?.target.formatted ?? formatCurrency(targetAmount);
    const collectedDisplay =
        project.funding?.collected.formatted ?? formatCurrency(collectedAmount);

    return (
        <div
            className="project-card"
            role="link"
            tabIndex={0}
            onClick={() => router.visit(projectUrl)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.visit(projectUrl);
                }
            }}
        >
            {/* Project Image */}
            <div className="project-image-wrapper relative bg-gradient-to-br from-green-400 to-blue-500">
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
            </div>

            {/* Donation Info */}
            <div className="project-donation-section">
                <div className="project-donation-info">
                    <div className="project-donation-labels">
                        <span>Необходимо</span>
                        <span>Собрали</span>
                    </div>
                    <div className="project-donation-progress-wrapper">
                        <div className="project-donation-progress-bar">
                            {targetAmount > 0 && (
                                <div
                                    className="project-donation-progress-fill"
                                    style={{
                                        width: `${progressPercentage}%`,
                                    }}
                                ></div>
                            )}
                        </div>
                    </div>
                    <div className="project-donation-amounts">
                        <span className="project-donation-target">
                            {targetDisplay}
                        </span>
                        <span className="project-donation-collected">
                            {collectedDisplay}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {/* Project Description */}
                {project.description && (
                    <p className="project-description line-clamp-2">
                        {project.description}
                    </p>
                )}

                {/* Project Title */}
                <h3 className="project-title">{project.title}</h3>
            </div>

            {/* Action Section */}
            <div className="project-action-section">
                <button
                    className="project-help-button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.visit(projectUrl);
                    }}
                    type="button"
                >
                    Помочь
                </button>
                {organizationName && organizationUrl && (
                    <Link
                        href={organizationUrl}
                        className="project-organization-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="project-organization-link-text">
                            {organizationName}
                        </span>
                        <img
                            src="/icons/direct-right.svg"
                            alt=""
                            className="project-organization-link-icon"
                        />
                    </Link>
                )}
            </div>
        </div>
    );
}
