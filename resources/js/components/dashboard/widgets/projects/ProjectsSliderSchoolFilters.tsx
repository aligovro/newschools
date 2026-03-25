import React from 'react';
import type { ProjectCategoryMeta } from './useProjectsSliderSchool';

interface Props {
    categories: ProjectCategoryMeta[];
    activeSlug: string;
    onSelect: (slug: string) => void;
    /** Показывать число проектов в категории (виджет); на странице списка можно отключить. */
    showCounts?: boolean;
    /** Подпись для сброса фильтра (на странице /projects — «Новые»). */
    allLabel?: string;
}

export const ProjectsSliderSchoolFilters: React.FC<Props> = ({
    categories,
    activeSlug,
    onSelect,
    showCounts = true,
    allLabel = 'Все',
}) => {
    return (
        <div className="projects-slider-school__filters">
            <button
                type="button"
                className={`projects-slider-school__filter-tab${activeSlug === '' ? ' projects-slider-school__filter-tab--active' : ''}`}
                onClick={() => onSelect('')}
            >
                {allLabel}
            </button>
            {categories.map((c) => (
                <button
                    key={c.slug}
                    type="button"
                    className={`projects-slider-school__filter-tab${activeSlug === c.slug ? ' projects-slider-school__filter-tab--active' : ''}`}
                    onClick={() => onSelect(c.slug)}
                >
                    {showCounts ? `${c.name} · ${c.count}` : c.name}
                </button>
            ))}
        </div>
    );
};
