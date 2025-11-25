import '@css/components/projects/project-wide-card.scss';
import { Link, router } from '@inertiajs/react';

import ShareButton from '@/components/ui/ShareButton';
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
    short_description?: string;
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

interface ProjectWideCardProps {
    project: Project;
}

export default function ProjectWideCard({ project }: ProjectWideCardProps) {
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
    const secondaryDescription =
        project.short_description ?? project.description;

    const handleNavigateToProject = () => {
        router.visit(projectUrl);
    };

    return (
        <div className="project-wide-card">
            <Link
                href={projectUrl}
                className="project-wide-image-wrapper relative bg-gradient-to-br from-green-400 to-blue-500"
            >
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
            </Link>

            <div className="project-wide-content">
                <div className="project-wide-donation-section">
                    <div className="project-wide-donation-labels">
                        <span>Необходимо</span>
                        <span>Собрали</span>
                    </div>
                    <div className="project-wide-donation-progress-wrapper">
                        <div className="project-wide-donation-progress-bar">
                            {targetAmount > 0 && (
                                <div
                                    className="project-wide-donation-progress-fill"
                                    style={{
                                        width: `${progressPercentage}%`,
                                    }}
                                ></div>
                            )}
                        </div>
                    </div>
                    <div className="project-wide-donation-amounts">
                        <span className="project-wide-donation-target">
                            {targetDisplay}
                        </span>
                        <span className="project-wide-donation-collected">
                            {collectedDisplay}
                        </span>
                    </div>
                </div>

                <div className="project-wide-header">
                    {secondaryDescription && (
                        <div
                            className="project-wide-description"
                            // HTML в описании проекта задается администраторами,
                            // поэтому мы считаем этот контент доверенным.
                            dangerouslySetInnerHTML={{
                                __html: secondaryDescription,
                            }}
                        />
                    )}
                    <h3 className="project-wide-title">
                        <Link
                            href={projectUrl}
                            className="project-wide-title-link"
                        >
                            {project.title}
                        </Link>
                    </h3>
                </div>

                <div className="project-wide-action-section">
                    <ShareButton url={projectUrl} />
                    <button
                        className="project-wide-help-button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNavigateToProject();
                        }}
                        type="button"
                    >
                        Помочь проекту
                    </button>
                    {organizationName && organizationUrl && (
                        <Link
                            href={organizationUrl}
                            className="project-wide-organization-link"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="project-wide-organization-link-text">
                                {organizationName}
                            </span>
                            <img
                                src="/icons/direct-right.svg"
                                alt=""
                                className="project-wide-organization-link-icon"
                            />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
