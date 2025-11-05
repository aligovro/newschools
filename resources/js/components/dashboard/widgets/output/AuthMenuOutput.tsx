import { AuthMenuWidget } from '@/components/dashboard/widgets/AuthMenuWidget';
import React from 'react';
import { WidgetOutputProps } from './types';

export const AuthMenuOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = (widget?.config || {}) as Record<string, unknown>;
    return (
        <div
            className={`auth-menu-widget auth-menu-output ${className || ''}`}
            style={style}
        >
            <AuthMenuWidget config={config} />
        </div>
    );
};
