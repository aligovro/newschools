import React from 'react';
import type { ProjectCategoryMeta } from './useProjectsSliderSchool';

interface Props {
    categories: ProjectCategoryMeta[];
    activeSlug: string;
    onSelect: (slug: string) => void;
}

export const ProjectsSliderSchoolFilters: React.FC<Props> = ({
    categories,
    activeSlug,
    onSelect,
}) => {
    return (
        <div className="projects-slider-school__filters">
            <button
                type="button"
                className={`projects-slider-school__filter-tab${activeSlug === '' ? ' projects-slider-school__filter-tab--active' : ''}`}
                onClick={() => onSelect('')}
            >
                Все
            </button>
            {categories.map((c) => (
                <button
                    key={c.slug}
                    type="button"
                    className={`projects-slider-school__filter-tab${activeSlug === c.slug ? ' projects-slider-school__filter-tab--active' : ''}`}
                    onClick={() => onSelect(c.slug)}
                >
                    {c.name} · {c.count}
                </button>
            ))}
        </div>
    );
};
