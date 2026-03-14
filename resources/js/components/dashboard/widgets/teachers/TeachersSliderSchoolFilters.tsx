import React from 'react';

interface Category {
    slug: string;
    label: string;
    count: number;
}

interface Props {
    categories: Category[];
    activeSlug: string;
    onSelect: (slug: string) => void;
}

export const TeachersSliderSchoolFilters: React.FC<Props> = ({
    categories,
    activeSlug,
    onSelect,
}) => {
    return (
        <div className="teachers-slider-school__filters">
            <button
                type="button"
                className={`teachers-slider-school__filter-tab${activeSlug === '' ? ' teachers-slider-school__filter-tab--active' : ''}`}
                onClick={() => onSelect('')}
            >
                Все
            </button>
            {categories.map((c) => (
                <button
                    key={c.slug}
                    type="button"
                    className={`teachers-slider-school__filter-tab${activeSlug === c.slug ? ' teachers-slider-school__filter-tab--active' : ''}`}
                    onClick={() => onSelect(c.slug)}
                >
                    {c.label}
                </button>
            ))}
        </div>
    );
};
