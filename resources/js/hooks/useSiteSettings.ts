import { useCallback, useState } from 'react';

interface SiteSettings {
    title: string;
    description: string;
    colorScheme: string;
    font: string;
    fontSize: string;
    layout: string;
    headerStyle: string;
    footerStyle: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
}

interface UseSiteSettingsProps {
    initialSettings: Partial<SiteSettings>;
}

export const useSiteSettings = ({ initialSettings }: UseSiteSettingsProps) => {
    const [siteSettings, setSiteSettings] = useState<SiteSettings>({
        title: '',
        description: '',
        colorScheme: 'blue',
        font: 'inter',
        fontSize: 'medium',
        layout: 'wide',
        headerStyle: 'default',
        footerStyle: 'default',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        ...initialSettings,
    });

    const updateSetting = useCallback(
        (key: keyof SiteSettings, value: string) => {
            setSiteSettings((prev) => ({
                ...prev,
                [key]: value,
            }));
        },
        [],
    );

    const updateSettings = useCallback((updates: Partial<SiteSettings>) => {
        setSiteSettings((prev) => ({
            ...prev,
            ...updates,
        }));
    }, []);

    const resetSettings = useCallback(() => {
        setSiteSettings({
            title: '',
            description: '',
            colorScheme: 'blue',
            font: 'inter',
            fontSize: 'medium',
            layout: 'wide',
            headerStyle: 'default',
            footerStyle: 'default',
            seoTitle: '',
            seoDescription: '',
            seoKeywords: '',
        });
    }, []);

    return {
        siteSettings,
        updateSetting,
        updateSettings,
        resetSettings,
    };
};
