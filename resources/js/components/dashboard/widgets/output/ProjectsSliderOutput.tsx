import React, { useMemo } from 'react';
import { ProjectsSliderWidget } from '../ProjectsSliderWidget';
import { WidgetOutputProps } from './types';

function parseOrgId(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : undefined;
}

export const ProjectsSliderOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = useMemo(() => {
        const cfg = (widget.config || {}) as Record<string, unknown>;
        // Fallback: read from configs array (builder format)
        const configs = (widget as { configs?: Array<{ config_key: string; config_value: string; config_type: string }> }).configs;
        const fromConfigs =
            configs?.find(
                (c) =>
                    c.config_key === 'organization_id' ||
                    c.config_key === 'organizationId',
            );
        const orgId =
            parseOrgId(cfg.organization_id) ??
            parseOrgId(cfg.organizationId) ??
            (fromConfigs
                ? parseOrgId(
                      fromConfigs.config_type === 'number'
                          ? parseFloat(fromConfigs.config_value)
                          : fromConfigs.config_value,
                  )
                : undefined);

        return {
            title: (cfg.title as string) || 'Проекты',
            show_title: (cfg.show_title as boolean) ?? true,
            organization_id: orgId,
            limit: cfg.limit ? Number(cfg.limit) : 6,
            slidesPerView: cfg.slidesPerView ? Number(cfg.slidesPerView) : 3,
            showHeaderActions: cfg.showHeaderActions !== false,
        };
    }, [widget]);

    return (
        <div className={className} style={style}>
            <ProjectsSliderWidget config={config} />
        </div>
    );
};

export default ProjectsSliderOutput;

