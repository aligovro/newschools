import React from 'react';
import { ProjectsSliderWidget } from '../ProjectsSliderWidget';
import { WidgetOutputProps } from './types';

export const ProjectsSliderOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const cfg = (widget.config || {}) as Record<string, unknown>;

    return (
        <div className={className} style={style}>
            <ProjectsSliderWidget
                config={{
                    title: (cfg.title as string) || 'Проекты',
                    show_title: (cfg.show_title as boolean) ?? true,
                    organization_id: cfg.organization_id
                        ? Number(cfg.organization_id)
                        : undefined,
                    limit: cfg.limit ? Number(cfg.limit) : 6,
                    slidesPerView: cfg.slidesPerView
                        ? Number(cfg.slidesPerView)
                        : 3,
                    showHeaderActions: cfg.showHeaderActions !== false,
                }}
            />
        </div>
    );
};

export default ProjectsSliderOutput;

