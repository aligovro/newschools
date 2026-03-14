import { router } from '@inertiajs/react';
import { Share2, Users } from 'lucide-react';
import React from 'react';
import type { ProjectForSchool } from './useProjectsSliderSchool';

function stripHtml(html: string): string {
    if (typeof document === 'undefined') {
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent ?? tmp.innerText ?? '').replace(/\s+/g, ' ').trim();
}

interface Props {
    project: ProjectForSchool;
}

export const ProjectsSliderSchoolCard: React.FC<Props> = ({ project }) => {
    const projectUrl = project.slug
        ? `/project/${project.slug}`
        : `/project/${project.id}`;
    const shortDesc = project.short_description ?? project.description ?? '';
    const displayDesc = shortDesc ? stripHtml(shortDesc).slice(0, 80) : '';
    const remaining =
        project.target_amount_rubles > project.collected_amount_rubles
            ? project.target_amount_rubles - project.collected_amount_rubles
            : 0;
    const remainingFormatted = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(remaining);

    return (
        <article
            className="projects-slider-school__card"
            role="button"
            tabIndex={0}
            onClick={() => router.visit(projectUrl)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.visit(projectUrl);
                }
            }}
        >
            <div className="projects-slider-school__card-inner">
                <div className="projects-slider-school__card-image-wrap">
                    {project.image ? (
                        <img
                            src={project.image}
                            alt={project.title}
                            className="projects-slider-school__card-image"
                            loading="lazy"
                        />
                    ) : (
                        <div className="projects-slider-school__card-image-placeholder">
                            <span>{project.title.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    <div className="projects-slider-school__card-image-overlay" />
                    <div className="projects-slider-school__card-progress">
                        <div className="projects-slider-school__card-progress-bar-wrap">
                            <div className="projects-slider-school__card-progress-bar">
                                <div
                                    className="projects-slider-school__card-progress-fill"
                                    style={{
                                        width: `${Math.min(100, project.progress_percentage)}%`,
                                    }}
                                />
                            </div>
                            <div
                                className="projects-slider-school__card-progress-pct"
                                title={`${Math.round(project.progress_percentage)}%`}
                            >
                                {Math.round(project.progress_percentage)}%
                            </div>
                        </div>
                        <div className="projects-slider-school__card-progress-amounts">
                            <div className="projects-slider-school__card-progress-collected">
                                {project.formatted_collected_amount}
                            </div>
                            <div className="projects-slider-school__card-progress-remaining">
                                Осталось {remainingFormatted}
                            </div>
                            <div className="projects-slider-school__card-progress-target">
                                {project.formatted_target_amount}
                            </div>
                        </div>
                        <div className="projects-slider-school__card-progress-labels">
                            <span>Собрали</span>
                            <span />
                            <span>Необходимо</span>
                        </div>
                    </div>
                </div>

                <div className="projects-slider-school__card-body">
                    <h3 className="projects-slider-school__card-title">
                        {project.title}
                    </h3>
                    {displayDesc && (
                        <p className="projects-slider-school__card-desc">
                            {displayDesc}
                        </p>
                    )}
                    <div className="projects-slider-school__card-stats">
                        <div className="projects-slider-school__card-stat">
                            <Users size={22} strokeWidth={1.5} />
                            <div>
                                <span className="projects-slider-school__card-stat-value">
                                    {project.donations_count ?? 0}
                                </span>
                                <span className="projects-slider-school__card-stat-label">
                                    Помощей
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="projects-slider-school__card-share"
                            aria-label="Поделиться"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (navigator.share) {
                                    navigator
                                        .share({
                                            title: project.title,
                                            url: window.location.origin + projectUrl,
                                        })
                                        .catch(() => {});
                                }
                            }}
                        >
                            <Share2 size={20} />
                            <span>Поделиться</span>
                        </button>
                    </div>
                    <button
                        type="button"
                        className="projects-slider-school__card-help"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.visit(projectUrl);
                        }}
                    >
                        Помочь сейчас
                    </button>
                </div>
            </div>
        </article>
    );
};
