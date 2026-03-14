import { usePage } from '@inertiajs/react';
import React, { useMemo } from 'react';
import { TeachersSliderSchoolWidget } from '../teachers/TeachersSliderSchoolWidget';
import { TeachersSliderWidget } from '../TeachersSliderWidget';
import { WidgetOutputProps } from './types';

function parseOrgId(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : undefined;
}

export const TeachersOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = useMemo(() => {
        const cfg = (widget.config || {}) as Record<string, unknown>;
        const configs = (widget as {
            configs?: Array<{
                config_key: string;
                config_value: string;
                config_type: string;
            }>;
        }).configs;

        const fromConfigs = configs?.find(
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
            title: (cfg.title as string) || 'Преподаватели',
            show_title: (cfg.show_title as boolean) ?? true,
            organization_id: orgId,
            limit: cfg.limit ? Number(cfg.limit) : 12,
            slidesPerView: cfg.slidesPerView ? Number(cfg.slidesPerView) : 4,
            staff: Array.isArray(cfg.staff) ? cfg.staff : undefined,
        };
    }, [widget]);

    const page = usePage();
    const siteTemplate = ((page?.props as Record<string, unknown>)?.site as Record<string, unknown>)?.template as string | undefined;
    const isSchool = siteTemplate === 'school';

    return (
        <div
            className={`teachers-output ${className || ''}`.trim()}
            style={style}
        >
            {isSchool ? (
                <TeachersSliderSchoolWidget config={config} />
            ) : (
                <TeachersSliderWidget config={config} />
            )}
        </div>
    );
};

export default TeachersOutput;
