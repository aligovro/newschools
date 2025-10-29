import React from 'react';
import { BasicSettings } from '../settings/BasicSettings';
import { DesignSettings } from '../settings/DesignSettings';
import PaymentSettings from '../settings/payments/PaymentSettings';
import { SeoSettings } from '../settings/SeoSettings';
import TelegramSettings from '../settings/telegram/TelegramSettings';

interface SettingsContentProps {
    site: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        favicon?: string;
        theme_config?: Record<string, unknown>;
        seo_config?: Record<string, unknown>;
        custom_settings?: Record<string, unknown>;
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
                            favicon: (site as any).favicon || '',
                        }}
                    />

                    <SeoSettings
                        siteId={site.id}
                        initialSettings={{
                            seo_title:
                                (site.seo_config as any)?.seo_title ??
                                site.name,
                            seo_description:
                                (site.seo_config as any)?.seo_description ??
                                site.description,
                            seo_keywords: (site.seo_config as any)
                                ?.seo_keywords,
                            og_title:
                                (site.seo_config as any)?.og_title ?? site.name,
                            og_description:
                                (site.seo_config as any)?.og_description ??
                                site.description,
                            og_type:
                                (site.seo_config as any)?.og_type ?? 'website',
                            og_image: (site.seo_config as any)?.og_image,
                            twitter_card:
                                (site.seo_config as any)?.twitter_card ??
                                'summary_large_image',
                            twitter_title:
                                (site.seo_config as any)?.twitter_title ??
                                site.name,
                            twitter_description:
                                (site.seo_config as any)?.twitter_description ??
                                site.description,
                            twitter_image: (site.seo_config as any)
                                ?.twitter_image,
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

                    <TelegramSettings
                        siteId={site.id}
                        initialSettings={{
                            enabled:
                                (site.custom_settings as any)?.telegram
                                    ?.enabled ?? false,
                            bot_token:
                                (site.custom_settings as any)?.telegram
                                    ?.bot_token ?? '',
                            chat_id:
                                (site.custom_settings as any)?.telegram
                                    ?.chat_id ?? '',
                            notifications:
                                (site.custom_settings as any)?.telegram
                                    ?.notifications ?? {},
                            note:
                                (site.custom_settings as any)?.telegram?.note ??
                                '',
                        }}
                    />

                    <PaymentSettings
                        siteId={site.id}
                        initialSettings={{
                            gateway:
                                (site.custom_settings as any)?.payments
                                    ?.gateway ?? 'yookassa',
                            credentials:
                                (site.custom_settings as any)?.payments
                                    ?.credentials ?? {},
                            options:
                                (site.custom_settings as any)?.payments
                                    ?.options ?? {},
                            donation_min_amount:
                                (site.custom_settings as any)?.payments
                                    ?.donation_min_amount ?? 100,
                            donation_max_amount:
                                (site.custom_settings as any)?.payments
                                    ?.donation_max_amount ?? 0,
                            currency:
                                (site.custom_settings as any)?.payments
                                    ?.currency ?? 'RUB',
                            test_mode:
                                (site.custom_settings as any)?.payments
                                    ?.test_mode ?? true,
                        }}
                    />
                </div>
            </div>
        );
    },
);

SettingsContent.displayName = 'SettingsContent';
