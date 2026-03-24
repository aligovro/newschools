import React, { useMemo } from 'react';

interface Props {
    /** Ежемесячная цель в копейках */
    monthlyGoalAmount: number;
    /** Собрано в текущем месяце в копейках (null = не вычислять) */
    monthlyCollected: number | null;
}

const formatRubles = (kopecks: number): string =>
    new Intl.NumberFormat('ru-RU').format(Math.round(kopecks / 100)) + ' ₽';

const ProjectMonthlyGoalPill: React.FC<Props> = ({ monthlyGoalAmount, monthlyCollected }) => {
    const collected = monthlyCollected ?? 0;
    const remaining = useMemo(
        () => Math.max(0, monthlyGoalAmount - collected),
        [monthlyGoalAmount, collected],
    );

    return (
        <div className="project-monthly-goal-pill" aria-label="Ежемесячная цель">
            <span className="project-monthly-goal-pill__label">Цель на месяц</span>
            <span className="project-monthly-goal-pill__goal">
                {formatRubles(monthlyGoalAmount)}
            </span>
            <span className="project-monthly-goal-pill__collected">
                {formatRubles(collected)}
            </span>
            <span className="project-monthly-goal-pill__remaining-label">
                Осталось
                <br />
                собрать
            </span>
            {remaining > 0 && (
                <span className="project-monthly-goal-pill__remaining-value">
                    {formatRubles(remaining)}
                </span>
            )}
        </div>
    );
};

export default React.memo(ProjectMonthlyGoalPill);
