import '@css/components/projects/project-stage-card.scss';
import type { MoneyAmount } from '@/types/money';

interface StageFunding {
    target: MoneyAmount;
    collected: MoneyAmount;
    progress_percentage: number;
}

interface ProjectStage {
    id: number;
    stage_number?: number;
    title: string;
    slug?: string;
    description?: string;
    funding?: StageFunding;
    target_amount_rubles?: number;
    target_amount?: number;
    collected_amount_rubles?: number;
    collected_amount?: number;
    progress_percentage?: number;
    image?: string;
    project_url?: string;
}

interface ProjectStageCardProps {
    stage: ProjectStage;
}

export default function ProjectStageCard({ stage }: ProjectStageCardProps) {
    const funding = stage.funding;

    const formatCurrency = (amount: number): string =>
        new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

    const targetAmount =
        funding?.target.value ??
        stage.target_amount_rubles ??
        stage.target_amount ??
        0;
    const collectedAmount =
        funding?.collected.value ??
        stage.collected_amount_rubles ??
        stage.collected_amount ??
        0;
    const progressPercentage = Math.min(
        funding?.progress_percentage ?? stage.progress_percentage ?? 0,
        100,
    );

    const targetDisplay =
        funding?.target.formatted ?? formatCurrency(targetAmount);
    const collectedDisplay =
        funding?.collected.formatted ?? formatCurrency(collectedAmount);

    return (
        <div className="project-stage-card">
            {/* Stage Image */}
            <div className="project-stage-image-wrapper relative bg-gradient-to-br from-green-400 to-blue-500">
                {stage.image ? (
                    <img
                        src={stage.image}
                        alt={stage.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center text-2xl font-bold text-white">
                            {stage.stage_number ||
                                stage.title.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}
            </div>

            {/* Stage Content */}
            <div className="project-stage-content">
                {/* Stage Header */}
                <div className="project-stage-header">
                    {stage.stage_number && (
                        <div className="project-stage-number">
                            {stage.stage_number} этап проекта
                        </div>
                    )}
                    <h3 className="project-stage-title">{stage.title}</h3>
                    {stage.description && (
                        <div
                            className="project-stage-description"
                            dangerouslySetInnerHTML={{
                                __html: stage.description,
                            }}
                        />
                    )}
                </div>

                {/* Donation Info */}
                <div className="project-stage-donation-section">
                    <div className="project-stage-donation-info">
                        <div className="project-stage-donation-labels">
                            <span>Необходимо</span>
                            <span>Собрали</span>
                        </div>
                        <div className="project-stage-donation-progress-wrapper">
                            <div className="project-stage-donation-progress-bar">
                                {targetAmount > 0 && (
                                    <div
                                        className="project-stage-donation-progress-fill"
                                        style={{
                                            width: `${progressPercentage}%`,
                                        }}
                                    ></div>
                                )}
                            </div>
                        </div>
                        <div className="project-stage-donation-amounts">
                            <span className="project-stage-donation-target">
                                {targetDisplay}
                            </span>
                            <span className="project-stage-donation-collected">
                                {collectedDisplay}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
