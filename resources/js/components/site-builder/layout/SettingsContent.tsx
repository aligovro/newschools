import React from 'react';
import { BasicSettings } from '../settings/BasicSettings';
import { DesignSettings } from '../settings/DesignSettings';
import { SeoSettings } from '../settings/SeoSettings';

interface SettingsContentProps {
    site: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        theme_config?: Record<string, unknown>;
        seo_config?: Record<string, unknown>;
    };
}

export const SettingsContent: React.FC<SettingsContentProps> = React.memo(
    ({ site }) => {
        return (
            <div className="h-full overflow-y-auto p-6">
                <div className="space-y-6 pb-20">
                    <BasicSettings
                        siteId={site.id}
                        initialSettings={{
                            name: site.name,
                            description: site.description || '',
                        }}
                    />

                    <DesignSettings
                        siteId={site.id}
                        initialSettings={{
                            color_scheme: (site.theme_config as any)
                                ?.color_scheme,
                            font_family: (site.theme_config as any)
                                ?.font_family,
                            font_size: (site.theme_config as any)?.font_size,
                            layout: (site.theme_config as any)?.layout,
                            header_style: (site.theme_config as any)
                                ?.header_style,
                            footer_style: (site.theme_config as any)
                                ?.footer_style,
                        }}
                    />

                    <SeoSettings
                        siteId={site.id}
                        initialSettings={{
                            seo_title: (site.seo_config as any)?.seo_title,
                            seo_description: (site.seo_config as any)
                                ?.seo_description,
                            seo_keywords: (site.seo_config as any)
                                ?.seo_keywords,
                        }}
                    />
                </div>
            </div>
        );
    },
);

SettingsContent.displayName = 'SettingsContent';
