export type RawSeoConfig = Record<string, unknown>;

export interface ComputedSeo {
    title: string;
    description: string;
    keywords?: string;
    canonicalUrl?: string;
    ogTitle: string;
    ogDescription: string;
    ogType: string;
    ogImage?: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage?: string;
    noindex?: boolean;
}

const getString = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim() !== '' ? value : undefined;

const getBoolean = (value: unknown): boolean | undefined => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const v = value.toLowerCase();
        if (v === 'true') return true;
        if (v === 'false') return false;
    }
    return undefined;
};

interface BuildSeoOptions {
    siteName: string;
    siteDescription?: string;
    rawSeo?: RawSeoConfig;
    /**
     * Optional page-level overrides.
     * For layouts, pageTitle/pageDescription usually имеют приоритет над настройками сайта.
     */
    pageTitleOverride?: string;
    pageDescriptionOverride?: string;
    currentUrl?: string;
}

export const buildSiteSeo = ({
    siteName,
    siteDescription,
    rawSeo = {},
    pageTitleOverride,
    pageDescriptionOverride,
    currentUrl,
}: BuildSeoOptions): ComputedSeo => {
    const seo = rawSeo;

    // Базовые поля с поддержкой разных ключей
    const seoTitle =
        getString(seo['seo_title']) ||
        getString(seo['meta_title']) ||
        getString(seo['title']);

    const seoDescription =
        getString(seo['seo_description']) ||
        getString(seo['meta_description']) ||
        getString(seo['description']);

    const seoKeywords =
        getString(seo['seo_keywords']) ||
        getString(seo['meta_keywords']) ||
        getString(seo['keywords']);

    // Title
    const metaTitle =
        pageTitleOverride || seoTitle || siteName;

    // Description
    const metaDescription =
        pageDescriptionOverride || seoDescription || siteDescription || '';

    // Canonical URL
    const canonicalUrl: string | undefined =
        getString(seo['canonical_url']) ||
        getString(seo['slug_url']) ||
        currentUrl;

    // OG
    const ogTitle =
        getString(seo['og_title']) || seoTitle || metaTitle;
    const ogDescription =
        getString(seo['og_description']) || seoDescription || metaDescription;
    const ogType = getString(seo['og_type']) || 'website';
    const ogImage =
        getString(seo['og_image']) || getString(seo['image']) || undefined;

    // Twitter
    const twitterCard =
        getString(seo['twitter_card']) || 'summary_large_image';
    const twitterTitle =
        getString(seo['twitter_title']) || ogTitle || metaTitle;
    const twitterDescription =
        getString(seo['twitter_description']) ||
        ogDescription ||
        metaDescription;
    const twitterImage =
        getString(seo['twitter_image']) || ogImage || undefined;

    const noindex = Boolean(getBoolean(seo['noindex']));

    return {
        title: metaTitle,
        description: metaDescription,
        keywords: seoKeywords,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogType,
        ogImage,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage,
        noindex,
    };
};


