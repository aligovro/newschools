import { DonationOutput } from '@/components/dashboard/widgets/output/DonationOutput';
import type { WidgetData } from '@/components/dashboard/site-builder/types';
import React, { useMemo } from 'react';

interface Props {
    /** Все виджеты сайта из site.widgets_config */
    widgets: WidgetData[];
}

/**
 * Ищет donation-виджет среди виджетов сайта и рендерит его в правой колонке.
 * DonationOutput самостоятельно подхватывает контекст проекта из page.props.
 */
const ProjectDonationColumn: React.FC<Props> = ({ widgets }) => {
    const donationWidget = useMemo(
        () => widgets.find((w) => w.widget_slug === 'donation' && w.is_active),
        [widgets],
    );

    if (!donationWidget) return null;

    return (
        <aside className="project-donation-column">
            <div className="project-donation-column__sticky">
                <DonationOutput widget={donationWidget} />
            </div>
        </aside>
    );
};

export default ProjectDonationColumn;
