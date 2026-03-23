import { AuthMenuWidget } from '@/components/dashboard/widgets/AuthMenuWidget';
import { usePage } from '@inertiajs/react';
import React from 'react';
import { SchoolAuthMenuOutput } from './SchoolAuthMenuOutput';
import { WidgetOutputProps } from './types';

export const AuthMenuOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const { props } = usePage();
    const site = (props as Record<string, unknown>)?.site as Record<string, unknown> | undefined;
    const template = site?.template as string | undefined;
    const config = (widget?.config || {}) as Record<string, unknown>;

    if (template === 'school') {
        return (
            <div
                className={`auth-menu-widget auth-menu-output auth-menu-output--school ${className || ''}`}
                style={style}
            >
                <SchoolAuthMenuOutput config={config} />
            </div>
        );
    }

    return (
        <div
            className={`auth-menu-widget auth-menu-output ${className || ''}`}
            style={style}
        >
            <AuthMenuWidget config={config} />
        </div>
    );
};
