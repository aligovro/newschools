import { SiteBuilder } from '@/components/site-builder/constructor/SiteBuilder';
import { memo } from 'react';
import type { OrganizationSite, SiteWidget } from '../types';

interface BuilderTabProps {
    site: OrganizationSite;
    widgets: SiteWidget[];
    onWidgetsChange: (widgets: any[], isLoading: boolean) => void;
    validationErrors: string[];
}

export default memo(function BuilderTab({
    site,
    widgets,
    onWidgetsChange,
    validationErrors,
}: BuilderTabProps) {
    if (!site.id) return null;
    return (
        <SiteBuilder
            siteId={site.id}
            template={site.template as unknown as Record<string, unknown>}
            initialLayoutConfig={site.layout_config || {}}
            initialWidgets={widgets as any}
            onWidgetsChange={onWidgetsChange}
            validationErrors={validationErrors}
        />
    );
});
