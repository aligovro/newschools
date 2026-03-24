import React from 'react';

interface FundingSummary {
    target: { value: number; formatted: string };
    collected: { value: number; formatted: string };
    progress_percentage: number;
}

interface Props {
    title: string;
    image?: string | null;
    funding: FundingSummary;
    /** Слот для pill «Цель на месяц» — размещается между заголовком и progress bar */
    pill?: React.ReactNode;
    /** Слот для share-кнопок — размещается поверх hero внизу */
    share?: React.ReactNode;
}

const ProjectHeroSchool: React.FC<Props> = ({ title, image, funding, pill, share }) => {
    const progress = Math.min(100, Math.max(0, funding.progress_percentage));
    const remaining = Math.max(0, funding.target.value - funding.collected.value);
    const remainingFormatted = new Intl.NumberFormat('ru-RU').format(Math.round(remaining)) + ' ₽';

    return (
        <div className="project-hero-school">
            {image ? (
                <img
                    src={image}
                    alt={title}
                    className="project-hero-school__image"
                    loading="eager"
                />
            ) : (
                <div className="project-hero-school__image project-hero-school__image--placeholder" />
            )}

            {/* Тёмный градиент-оверлей */}
            <div className="project-hero-school__overlay" aria-hidden="true" />

            {/* Заголовок */}
            <h1 className="project-hero-school__title">{title}</h1>

            {/* Pill «Цель на месяц» — между заголовком и progress bar */}
            {pill && <div className="project-hero-school__pill">{pill}</div>}

            {/* Прогресс-трек */}
            <div className="project-hero-school__progress-wrap">
                <div className="project-hero-school__progress-track">
                    <div
                        className="project-hero-school__progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Суммы: левая — собрано, центр — % бейдж + осталось, правая — цель */}
            <div className="project-hero-school__amounts">
                <div className="project-hero-school__amount project-hero-school__amount--collected">
                    <span className="project-hero-school__amount-value project-hero-school__amount-value--accent">
                        {funding.collected.formatted}
                    </span>
                    <span className="project-hero-school__amount-label">Собрали</span>
                </div>

                <div className="project-hero-school__amount project-hero-school__amount--center">
                    <div className="project-hero-school__progress-badge">{progress}%</div>
                    <span className="project-hero-school__amount-remaining">
                        Осталось {remainingFormatted}
                    </span>
                </div>

                <div className="project-hero-school__amount project-hero-school__amount--target">
                    <span className="project-hero-school__amount-value">
                        {funding.target.formatted}
                    </span>
                    <span className="project-hero-school__amount-label">Необходимо</span>
                </div>
            </div>

            {/* Share-кнопки — внизу hero */}
            {share && <div className="project-hero-school__share">{share}</div>}
        </div>
    );
};

export default React.memo(ProjectHeroSchool);
