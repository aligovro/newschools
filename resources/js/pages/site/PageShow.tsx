import PageViewer from '@/components/PageViewer';
import React from 'react';

interface Page {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    status: string;
    template: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    seo_image: string;
    featured_image: string;
    is_homepage: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    url: string;
    parent?: Page;
    children?: Page[];
    breadcrumbs: Array<{
        title: string;
        url: string;
        slug: string;
    }>;
}

interface Organization {
    id: number;
    name: string;
    domain: string;
    logo?: string;
    description?: string;
}

interface PageShowProps {
    organization: Organization;
    page: Page;
    navigationPages?: Page[];
}

const SitePageShow: React.FC<PageShowProps> = ({
    organization,
    page,
    navigationPages,
}) => {
    return (
        <PageViewer
            organization={organization}
            page={page}
            navigationPages={navigationPages}
        />
    );
};

export default SitePageShow;
