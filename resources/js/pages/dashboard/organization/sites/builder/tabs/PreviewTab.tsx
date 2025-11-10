import SitePreview from '@/pages/SitePreview';
import { memo } from 'react';
import type { OrganizationSite } from '../types';
import { getConfigValue } from '../types';

interface PreviewTabProps {
    site: OrganizationSite;
}

export default memo(function PreviewTab({ site }: PreviewTabProps) {
    console.log('PreviewTab - Component rendered with site:', {
        id: site.id,
        name: site.name,
        has_widgets: !!site.widgets,
        widgets_type: typeof site.widgets,
        widgets_length: site.widgets?.length,
    });

    if (!site.id) {
        console.log('PreviewTab - No site ID, returning null');
        return null;
    }

    // Логируем данные сайта для отладки (временно отключено)
    // console.log('PreviewTab - Site data:', {
    //     id: site.id,
    //     name: site.name,
    //     widgets_count: site.widgets?.length || 0,
    //     widgets: site.widgets?.map((w) => ({
    //         id: w.id,
    //         widget_slug: w.widget_slug,
    //         name: w.name,
    //         has_hero_slides: !!w.hero_slides,
    //         has_slider_slides: !!w.slider_slides,
    //         hero_slides_count: w.hero_slides?.length || 0,
    //         slider_slides_count: w.slider_slides?.length || 0,
    //         config_keys: Object.keys(w.config || {}),
    //         config: w.config,
    //     })),
    // });

    return (
        <div className="h-full overflow-auto bg-white">
            <SitePreview
                site={{
                    id: site.id,
                    name: site.name,
                    slug: site.slug,
                    description: site.description,
                    template: site.template as unknown as string,
                    widgets_config: (site.widgets || []).map((w) => ({
                        id: String(w.id),
                        name: w.name,
                        widget_slug: w.widget_slug,
                        config: {
                            alignment: getConfigValue(
                                w.configs,
                                'alignment',
                                'start',
                            ) as string,
                            fontSize: getConfigValue(
                                w.configs,
                                'fontSize',
                                '16px',
                            ) as string,
                            gap: getConfigValue(w.configs, 'gap', 12) as number,
                            items: getConfigValue(
                                w.configs,
                                'items',
                                [],
                            ) as unknown[],
                            orientation: getConfigValue(
                                w.configs,
                                'orientation',
                                'row',
                            ) as string,
                            styling: getConfigValue(
                                w.configs,
                                'styling',
                                {},
                            ) as Record<string, unknown>,
                            title: getConfigValue(
                                w.configs,
                                'title',
                                '',
                            ) as string,
                            uppercase: getConfigValue(
                                w.configs,
                                'uppercase',
                                false,
                            ) as boolean,
                            // Добавляем все остальные конфигурации
                            ...w.config,
                        },
                        settings: w.settings || {},
                        position_name: w.position_name,
                        position_slug: w.position_slug,
                        order: w.order,
                        is_active: w.is_active,
                        is_visible: w.is_visible,
                        // Передаем слайды
                        hero_slides: w.hero_slides,
                        slider_slides: w.slider_slides,
                    })),
                    seo_config: site.seo_config || {},
                }}
            />
        </div>
    );
});
