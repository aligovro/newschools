import React from 'react';

interface Props {
    title: string;
    image?: string | null;
    /** Строки для чипов под заголовком, например «16:00 — Пн, Ср» */
    scheduleChips?: string[];
    showPreregistrationChip?: boolean;
}

const ClubHeroSchool: React.FC<Props> = ({
    title,
    image,
    scheduleChips = [],
    showPreregistrationChip = true,
}) => {
    return (
        <div className="club-hero-school">
            {image ? (
                <img
                    src={image}
                    alt={title}
                    className="club-hero-school__image"
                    loading="eager"
                />
            ) : (
                <div
                    className="club-hero-school__image club-hero-school__image--placeholder"
                    aria-hidden
                />
            )}
            <div className="club-hero-school__overlay" aria-hidden />
            <div className="club-hero-school__inner">
                <h1 className="club-hero-school__title">{title}</h1>
                {(scheduleChips.length > 0 || showPreregistrationChip) && (
                    <div className="club-hero-school__chips">
                        {scheduleChips.map((label, idx) => (
                            <span key={`${idx}-${label}`} className="club-hero-school__chip">
                                {label}
                            </span>
                        ))}
                        {showPreregistrationChip && (
                            <span className="club-hero-school__chip club-hero-school__chip--emphasis">
                                По предварительной записи
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(ClubHeroSchool);
