import React, { useMemo } from 'react';
import { ClubsSliderWidget } from '../ClubsSliderWidget';
import { WidgetOutputProps } from './types';

interface Club {
    id: number;
    name: string;
    description?: string | null;
    image?: string | null;
    schedule?: Record<string, string | null>;
}

function parseOrgId(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : undefined;
}

export const ClubsOutput: React.FC<WidgetOutputProps> = ({
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

        const limit = cfg.limit ? Number(cfg.limit) : 12;
        const clubs = Array.isArray(cfg.clubs)
            ? (cfg.clubs as Club[]).map((c) => ({
                  id: Number(c.id),
                  name: String(c.name ?? ''),
                  description: (c.description as string) ?? null,
                  image: (c.image as string) ?? null,
                  schedule: (c.schedule as Record<string, string | null>) ?? undefined,
              }))
            : [];

        return {
            title: (cfg.title as string) || 'Кружки и секции',
            show_title: (cfg.show_title as boolean) ?? true,
            organization_id: orgId,
            limit,
            clubs: clubs.length > 0 ? clubs : undefined,
        };
    }, [widget]);

    return (
        <div
            className={`clubs-output ${className || ''}`.trim()}
            style={style}
        >
            <ClubsSliderWidget config={config} />
        </div>
    );
};

export default ClubsOutput;
