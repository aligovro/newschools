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

export const VideoLessonsSliderSchoolFilters: React.FC<Props> = ({
    categories,
    activeSlug,
    onSelect,
}) => {
    return (
        <div className="video-lessons-slider-school__filters">
            <button
                type="button"
                className={`video-lessons-slider-school__filter-tab${activeSlug === '' ? ' video-lessons-slider-school__filter-tab--active' : ''}`}
                onClick={() => onSelect('')}
            >
                Все
            </button>
            {categories.map((c) => (
                <button
                    key={c.slug}
                    type="button"
                    className={`video-lessons-slider-school__filter-tab${activeSlug === c.slug ? ' video-lessons-slider-school__filter-tab--active' : ''}`}
                    onClick={() => onSelect(c.slug)}
                >
                    {c.label}
                </button>
            ))}
        </div>
    );
};
