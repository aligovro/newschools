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
import { HtmlOutput } from './HtmlOutput';
import { ImageOutput } from './ImageOutput';
import { MenuOutput } from './MenuOutput';
import { ProjectsOutput } from './ProjectsOutput';
import { ReferralLeaderboardOutput } from './ReferralLeaderboardOutput';
import { CitySupportersOutput } from './CitySupportersOutput';
import { SliderOutput } from './SliderOutput';
import { StatsOutput } from './StatsOutput';
import { SubscribeBlockOutput } from './SubscribeBlockOutput';
import { AddOrganizationBlockOutput } from './AddOrganizationBlockOutput';
import { OrganizationSearchOutput } from './OrganizationSearchOutput';
import { TextOutput } from './TextOutput';
import { TopDonorsOutput } from './TopDonorsOutput';
import { TopRecurringDonorsOutput } from './TopRecurringDonorsOutput';
import { OrgDonationsFeedOutput } from './OrgDonationsFeedOutput';
import { CityOrganizationsOutput } from './CityOrganizationsOutput';
import { ProjectsSliderOutput } from './ProjectsSliderOutput';
import { ShareButtonsOutput } from './ShareButtonsOutput';

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
    city_supporters: CitySupportersOutput,
    referral_leaderboard: ReferralLeaderboardOutput,
    city_organizations: CityOrganizationsOutput,
    projects_slider: ProjectsSliderOutput,
    subscribe_block: SubscribeBlockOutput,
    add_organization_block: AddOrganizationBlockOutput,
    organization_search: OrganizationSearchOutput,
    top_donors: TopDonorsOutput,
    top_recurring_donors: TopRecurringDonorsOutput,
    org_top_donors: TopDonorsOutput,
    org_top_recurring_donors: TopRecurringDonorsOutput,
    org_donations_feed: OrgDonationsFeedOutput,
    share_buttons: ShareButtonsOutput,
    html: HtmlOutput,
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

/** Класс для подключения стилей виджета из SCSS (.menu-widget, .hero-widget и т.д.) */
function widgetSlugToCssClass(slug: string): string {
    if (!slug || typeof slug !== 'string') return '';
    return `${slug.replace(/_/g, '-')}-widget`;
}

// Main WidgetOutputRenderer component
export const WidgetOutputRenderer: React.FC<WidgetOutputProps> = memo(
    ({ widget, className, style }) => {
        // Get the appropriate output component
        const widgetSlug = (widget as any).widget_slug;
        const OutputComponent = outputRegistry[widgetSlug] || DefaultOutput;
        const widgetCssClass = widgetSlugToCssClass(widgetSlug);

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
                className={`widget-output ${widgetCssClass} ${shadowClass} ${extraClass} ${className || ''}`.trim()}
                style={combinedStyle}
            >
                <OutputComponent widget={widget} className="" style={{}} />
            </div>
        );
    },
);

WidgetOutputRenderer.displayName = 'WidgetOutputRenderer';
