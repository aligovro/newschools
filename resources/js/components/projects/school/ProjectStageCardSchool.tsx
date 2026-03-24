import React from 'react';

interface StageFunding {
    target: { value: number; formatted: string };
    collected: { value: number; formatted: string };
    progress_percentage: number;
}

interface ProjectStage {
    id: number;
    stage_number?: number;
    sort_order: number;
    title: string;
    description?: string | null;
    image?: string | null;
    funding: StageFunding;
    formatted_target_amount: string;
    formatted_collected_amount: string;
    progress_percentage: number;
    status: string;
    is_completed: boolean;
    is_active: boolean;
}

interface Props {
    stage: ProjectStage;
    stageIndex: number;
}

const ProjectStageCardSchool: React.FC<Props> = ({ stage, stageIndex }) => {
    const progress = Math.min(100, Math.max(0, stage.progress_percentage));
    const stageNum = stage.stage_number ?? stage.sort_order ?? stageIndex + 1;

    return (
        <article
            className={`project-stage-school ${
                stage.is_completed ? 'project-stage-school--completed' : ''
            } ${stage.is_active ? 'project-stage-school--active' : ''}`}
        >
            {stage.image && (
                <div className="project-stage-school__image-wrap">
                    <img
                        src={stage.image}
                        alt={stage.title}
                        className="project-stage-school__image"
                        loading="lazy"
                    />
                </div>
            )}

            <div className="project-stage-school__content">
                <span className="project-stage-school__label">
                    {stageNum} этап проекта
                </span>
                <h3 className="project-stage-school__title">{stage.title}</h3>

                {stage.description && (
                    <p className="project-stage-school__description">
                        {stage.description}
                    </p>
                )}

                <div className="project-stage-school__funding">
                    <div className="project-stage-school__funding-row">
                        <span className="project-stage-school__funding-label">
                            Необходимо
                        </span>
                        <span className="project-stage-school__funding-label project-stage-school__funding-label--right">
                            Собрали
                        </span>
                    </div>
                    <div className="project-stage-school__funding-row">
                        <span className="project-stage-school__funding-amount">
                            {stage.formatted_target_amount}
                        </span>
                        <span className="project-stage-school__funding-amount project-stage-school__funding-amount--collected">
                            {stage.formatted_collected_amount}
                        </span>
                    </div>

                    <div className="project-stage-school__progress-track">
                        <div
                            className="project-stage-school__progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
};

export default React.memo(ProjectStageCardSchool);
