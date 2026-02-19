import React from 'react';
import { BasicSettings } from '../settings/BasicSettings';
import { CustomStylesSettings } from '../settings/CustomStylesSettings';
import { DesignSettings } from '../settings/DesignSettings';
import { DomainSettings } from '../settings/DomainSettings';
import PaymentSettings from '../settings/payments/PaymentSettings';
import { SeoSettings } from '../settings/SeoSettings';
import TelegramSettings from '../settings/telegram/TelegramSettings';
import { BankRequisitesSettings } from '@/components/dashboard/bank-requisites/BankRequisitesSettings';

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
        domain?: {
            id: number;
            domain: string;
            custom_domain?: string;
            beget_domain_id?: number;
        } | null;
    };
    organization?: { 
        id: number;
        settings?: { payment_settings?: any };
    };
}

export const SettingsContent: React.FC<SettingsContentProps> = React.memo(
    ({ site, organization }) => {
        return (
            <div className="h-full overflow-y-auto p-6">
                <div className="space-y-6 pb-20">
                    {organization && (
                        <DomainSettings
                            siteId={site.id}
                            organizationId={organization.id}
                            domain={site.domain}
                        />
                    )}
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

                    <CustomStylesSettings
                        siteId={site.id}
                        initialCss={(site.custom_settings as any)?.custom_css}
                        stylesFilePath={
                            (site as { styles_file_path?: string | null })
                                ?.styles_file_path ?? null
                        }
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
                            // Новый источник: site.payment_settings
                            gateway:
                                (site as any)?.payment_settings?.gateway ??
                                (site.custom_settings as any)?.payments
                                    ?.gateway ??
                                'yookassa',
                            enabled_gateways:
                                (site as any)?.payment_settings
                                    ?.enabled_gateways ??
                                (site.custom_settings as any)?.payments
                                    ?.enabled_gateways,
                            credentials:
                                (site as any)?.payment_settings?.credentials ??
                                (site.custom_settings as any)?.payments
                                    ?.credentials ??
                                {},
                            options:
                                (site as any)?.payment_settings?.options ??
                                (site.custom_settings as any)?.payments
                                    ?.options ??
                                {},
                            donation_min_amount:
                                (site as any)?.payment_settings
                                    ?.donation_min_amount ??
                                (site.custom_settings as any)?.payments
                                    ?.donation_min_amount ??
                                100,
                            donation_max_amount:
                                (site as any)?.payment_settings
                                    ?.donation_max_amount ??
                                (site.custom_settings as any)?.payments
                                    ?.donation_max_amount ??
                                0,
                            currency:
                                (site as any)?.payment_settings?.currency ??
                                (site.custom_settings as any)?.payments
                                    ?.currency ??
                                'RUB',
                            test_mode:
                                (site as any)?.payment_settings?.test_mode ??
                                (site.custom_settings as any)?.payments
                                    ?.test_mode ??
                                true,
                        }}
                    />

                    {organization && (
                        <BankRequisitesSettings
                            entityId={site.id}
                            entityType="site"
                            initialRequisites={{
                                // Структурированные поля
                                recipient_name: (site.custom_settings as any)?.bank_requisites_structured?.recipient_name,
                                bank_name: (site.custom_settings as any)?.bank_requisites_structured?.bank_name,
                                inn: (site.custom_settings as any)?.bank_requisites_structured?.inn,
                                kpp: (site.custom_settings as any)?.bank_requisites_structured?.kpp,
                                bik: (site.custom_settings as any)?.bank_requisites_structured?.bik,
                                account: (site.custom_settings as any)?.bank_requisites_structured?.account,
                                corr_account: (site.custom_settings as any)?.bank_requisites_structured?.corr_account,
                                beneficiary_name: (site.custom_settings as any)?.bank_requisites_structured?.beneficiary_name,
                                ogrn: (site.custom_settings as any)?.bank_requisites_structured?.ogrn,
                                address: (site.custom_settings as any)?.bank_requisites_structured?.address,
                                // Текстовое поле (для обратной совместимости)
                                bank_requisites: (site.custom_settings as any)?.bank_requisites,
                                sber_card: (site.custom_settings as any)?.sber_card,
                                tinkoff_card: (site.custom_settings as any)?.tinkoff_card,
                                card_recipient: (site.custom_settings as any)?.card_recipient,
                            }}
                            organizationRequisites={organization?.settings?.payment_settings ? {
                                recipient_name: organization.settings.payment_settings.bank_requisites_structured?.recipient_name,
                                bank_name: organization.settings.payment_settings.bank_requisites_structured?.bank_name,
                                inn: organization.settings.payment_settings.bank_requisites_structured?.inn,
                                kpp: organization.settings.payment_settings.bank_requisites_structured?.kpp,
                                bik: organization.settings.payment_settings.bank_requisites_structured?.bik,
                                account: organization.settings.payment_settings.bank_requisites_structured?.account,
                                corr_account: organization.settings.payment_settings.bank_requisites_structured?.corr_account,
                                beneficiary_name: organization.settings.payment_settings.bank_requisites_structured?.beneficiary_name,
                                ogrn: organization.settings.payment_settings.bank_requisites_structured?.ogrn,
                                address: organization.settings.payment_settings.bank_requisites_structured?.address,
                                bank_requisites: organization.settings.payment_settings.bank_requisites,
                                sber_card: organization.settings.payment_settings.sber_card,
                                tinkoff_card: organization.settings.payment_settings.tinkoff_card,
                                card_recipient: organization.settings.payment_settings.card_recipient,
                            } : null}
                            showInheritanceInfo={true}
                        />
                    )}
                </div>
            </div>
        );
    },
);

SettingsContent.displayName = 'SettingsContent';
