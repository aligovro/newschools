import React, { useState } from 'react';

interface BudgetItem {
    id: number;
    title: string;
    formatted_amount: string;
    sort_order: number;
}

interface Props {
    description?: string | null;
    budgetItems?: BudgetItem[];
    /** Сколько строк описания показывать до «Показать полностью» */
    descriptionClampLines?: number;
    /** Сколько статей расходов показывать до «Показать полностью» */
    budgetPreviewCount?: number;
}

const DESCRIPTION_CLAMP = 5;
const BUDGET_PREVIEW = 5;

const ProjectAboutSchool: React.FC<Props> = ({
    description,
    budgetItems = [],
    descriptionClampLines = DESCRIPTION_CLAMP,
    budgetPreviewCount = BUDGET_PREVIEW,
}) => {
    const [descExpanded, setDescExpanded] = useState(false);
    const [budgetExpanded, setBudgetExpanded] = useState(false);

    const hasDescription = !!description?.trim();
    const hasBudget = budgetItems.length > 0;

    if (!hasDescription && !hasBudget) return null;

    const visibleItems = budgetExpanded ? budgetItems : budgetItems.slice(0, budgetPreviewCount);

    return (
        <div className="project-about-school">
            {hasDescription && (
                <section className="project-about-school__section">
                    <h2 className="project-about-school__heading">О проекте</h2>
                    <div
                        className={`project-about-school__description ${
                            !descExpanded
                                ? `project-about-school__description--clamped`
                                : ''
                        }`}
                        style={
                            !descExpanded
                                ? ({
                                      '--clamp-lines': descriptionClampLines,
                                  } as React.CSSProperties)
                                : undefined
                        }
                        dangerouslySetInnerHTML={{ __html: description! }}
                    />
                    {!descExpanded && (
                        <button
                            type="button"
                            className="project-about-school__show-more"
                            onClick={() => setDescExpanded(true)}
                        >
                            Показать полностью
                        </button>
                    )}
                </section>
            )}

            {hasBudget && (
                <section className="project-about-school__section project-about-school__section--budget">
                    <h2 className="project-about-school__heading">Статьи расходов</h2>
                    <ol className="project-about-school__budget-list">
                        {visibleItems.map((item, idx) => (
                            <li key={item.id} className="project-about-school__budget-item">
                                <div className="project-about-school__budget-main">
                                    <span className="project-about-school__budget-num">
                                        {String(idx + 1).padStart(2, '0')}.
                                    </span>
                                    <span className="project-about-school__budget-title">
                                        {item.title}
                                    </span>
                                </div>
                                <div className="project-about-school__budget-price">
                                    {item.formatted_amount}
                                </div>
                            </li>
                        ))}
                    </ol>
                    {budgetItems.length > budgetPreviewCount && (
                        <button
                            type="button"
                            className="project-about-school__show-more"
                            onClick={() => setBudgetExpanded((v) => !v)}
                        >
                            {budgetExpanded ? 'Скрыть' : 'Показать полностью'}
                        </button>
                    )}
                </section>
            )}
        </div>
    );
};

export default ProjectAboutSchool;
