import React from 'react';
import { OrganizationsSliderWidget } from '../OrganizationsSliderWidget';
import { WidgetOutputProps } from './types';

export const CityOrganizationsOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const cfg = (widget.config || {}) as any;

    return (
        <div className={className} style={style}>
            <OrganizationsSliderWidget
                config={{
                    title: cfg.title || 'Школы города',
                    city_id: cfg.city_id as number,
                    limit: (cfg.limit as number) || 9,
                    slidesPerView: (cfg.slidesPerView as number) || 3,
                    showHeaderActions: cfg.showHeaderActions !== false,
                }}
            />
        </div>
    );
};

export default CityOrganizationsOutput;
