import React, { memo } from 'react';
import { WidgetOutputProps } from './types';

// Import all output components
import { AlumniStatsOutput } from './AlumniStatsOutput';
import { AuthMenuOutput } from './AuthMenuOutput';
import { ContactOutput } from './ContactOutput';
import { DonationOutput } from './DonationOutput';
import { DonationsListOutput } from './DonationsListOutput';
import { FormOutput } from './FormOutput';
import { GalleryOutput } from './GalleryOutput';
import { HeroOutput } from './HeroOutput';
import { ImageOutput } from './ImageOutput';
import { MenuOutput } from './MenuOutput';
import { ProjectsOutput } from './ProjectsOutput';
import { ReferralLeaderboardOutput } from './ReferralLeaderboardOutput';
import { RegionRatingOutput } from './RegionRatingOutput';
import { SliderOutput } from './SliderOutput';
import { StatsOutput } from './StatsOutput';
import { TextOutput } from './TextOutput';

// Registry of output components
const outputRegistry: Record<string, React.ComponentType<WidgetOutputProps>> = {
    hero: HeroOutput,
    slider: SliderOutput,
    text: TextOutput,
    image: ImageOutput,
    gallery: GalleryOutput,
    stats: StatsOutput,
    alumni_stats: AlumniStatsOutput,
    projects: ProjectsOutput,
    contact: ContactOutput,
    menu: MenuOutput,
    auth_menu: AuthMenuOutput,
    form: FormOutput,
    donation: DonationOutput,
    donations_list: DonationsListOutput,
    region_rating: RegionRatingOutput,
    referral_leaderboard: ReferralLeaderboardOutput,
};

// Default output component for unknown widgets
const DefaultOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => (
    <div className={`widget-output-default ${className || ''}`} style={style}>
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {widget.name}
            </h3>
            <p className="text-gray-600">
                Виджет "{(widget as any).widget_slug}" не поддерживается в
                режиме предпросмотра
            </p>
        </div>
    </div>
);

// Main WidgetOutputRenderer component
export const WidgetOutputRenderer: React.FC<WidgetOutputProps> = memo(
    ({ widget, className, style }) => {
        // Get the appropriate output component
        const widgetSlug = (widget as any).widget_slug;
        const OutputComponent = outputRegistry[widgetSlug] || DefaultOutput;

        // Apply universal styling if present in config.styling
        const styling = (widget.config?.styling || {}) as any;
        const combinedStyle: React.CSSProperties = {
            backgroundColor: styling.backgroundColor,
            color: styling.textColor,
            padding: styling.padding,
            margin: styling.margin,
            borderRadius: styling.borderRadius,
            borderWidth: styling.borderWidth,
            borderColor: styling.borderColor,
            borderStyle: styling.borderWidth ? 'solid' : undefined,
            ...style,
        };

        const shadowClass =
            styling.boxShadow === 'sm'
                ? 'shadow-sm'
                : styling.boxShadow === 'md'
                  ? 'shadow-md'
                  : styling.boxShadow === 'lg'
                    ? 'shadow-lg'
                    : '';

        const extraClass = styling.customClass || '';

        return (
            <div
                className={`widget-output ${shadowClass} ${extraClass} ${className || ''}`}
                style={combinedStyle}
            >
                <OutputComponent widget={widget} className="" style={{}} />
            </div>
        );
    },
);

WidgetOutputRenderer.displayName = 'WidgetOutputRenderer';
