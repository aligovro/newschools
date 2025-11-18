import type {
    WidgetData,
    WidgetPosition,
} from '@/components/dashboard/site-builder/types';
import MainLayout from '@/layouts/MainLayout';
import { type BreadcrumbItem } from '@/types';
import React, { useMemo } from 'react';

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    favicon?: string;
    template: string;
    site_type: 'main' | 'organization';
    widgets_config: WidgetData[];
    seo_config?: Record<string, unknown>;
    layout_config?: {
        sidebar_position?: 'left' | 'right';
    };
}

interface Page {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    status: string;
    template?: string;
    is_homepage: boolean;
    is_public: boolean;
    show_in_navigation: boolean;
    image?: string;
    images?: string[];
    published_at?: string | null;
    created_at: string;
    updated_at: string;
    parent?: {
        id: number;
        title: string;
        slug: string;
    };
    children?: Array<{
        id: number;
        title: string;
        slug: string;
        sort_order: number;
    }>;
}

interface PageSeo {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
}

interface PageShowProps {
    site: Site;
    page: Page;
    positions?: WidgetPosition[];
    position_settings?: Array<{
        position_slug: string;
        visibility_rules?: {
            mode?: 'all' | 'include' | 'exclude';
            routes?: string[];
            pages?: unknown[];
        };
        layout_overrides?: Record<string, unknown>;
    }>;
    pageSeo?: PageSeo;
    seo?: {
        title?: string;
        description?: string;
        keywords?: string;
        canonical_url?: string;
        og_title?: string;
        og_description?: string;
        og_type?: string;
        og_image?: string;
        twitter_card?: string;
        twitter_title?: string;
        twitter_description?: string;
        twitter_image?: string;
    };
}

const SitePageShow: React.FC<PageShowProps> = ({
    site,
    page,
    positions = [],
    position_settings = [],
    pageSeo = {},
    seo,
}) => {
    // Мемоизируем рендер контента
    const renderedContent = useMemo(() => {
        if (!page.content) {
            return (
                <div className="py-12 text-center">
                    <div className="text-muted-foreground">
                        <p className="mb-2 text-lg">
                            Содержимое страницы отсутствует
                        </p>
                        <p className="text-sm">
                            Эта страница еще не содержит контента.
                        </p>
                    </div>
                </div>
            );
        }

        // Если контент содержит HTML, рендерим его
        if (page.content.includes('<')) {
            return (
                <div
                    className="page-content-html"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            );
        }

        // Иначе рендерим как текст с переносами строк
        return (
            <div className="prose prose-gray max-w-none">
                {page.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                        {paragraph || '\u00A0'}
                    </p>
                ))}
            </div>
        );
    }, [page.content]);

    // Мемоизируем дополнительные изображения
    const renderedImages = useMemo(() => {
        if (!page.images || page.images.length === 0) {
            return null;
        }

        return (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                {page.images.map((imageUrl, index) => (
                    <img
                        key={index}
                        src={imageUrl}
                        alt={`${page.title} - ${index + 1}`}
                        className="h-48 w-full rounded-lg object-cover"
                        loading="lazy"
                    />
                ))}
            </div>
        );
    }, [page.images, page.title]);

    // Мемоизируем дочерние страницы
    const renderedChildren = useMemo(() => {
        if (!page.children || page.children.length === 0) {
            return null;
        }

        return (
            <div className="mt-8">
                <h2 className="mb-4 text-2xl font-semibold">
                    Дополнительные страницы
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {page.children.map((child) => (
                        <a
                            key={child.id}
                            href={`/${child.slug}`}
                            className="hover:bg-muted rounded-lg border p-4 transition-colors"
                        >
                            <h3 className="font-semibold">{child.title}</h3>
                        </a>
                    ))}
                </div>
            </div>
        );
    }, [page.children]);

    const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
        const items: BreadcrumbItem[] = [
            { title: 'Главная', href: '/' },
        ];

        if (page.parent) {
            items.push(
                { title: page.parent.title, href: `/${page.parent.slug}` },
            );
        }

        items.push({ title: page.title, href: '' });

        return items;
    }, [page.parent, page.title]);

    // Формируем SEO заголовок/описание:
    // 1) Если сервер уже посчитал seo.title/description — берем их.
    // 2) Иначе fallback на локальные правила.
    const seoTitle = useMemo(() => {
        if (seo?.title) return seo.title;
        if (page.is_homepage) {
            const siteName =
                (site.seo_config?.site_name as string) || site.name;
            return pageSeo.title || siteName;
        }
        return pageSeo.title || `${page.title} - ${site.name}`;
    }, [
        seo?.title,
        page.is_homepage,
        page.title,
        pageSeo.title,
        site.name,
        site.seo_config,
    ]);

    const seoDescription = useMemo(() => {
        if (seo?.description) return seo.description;
        const seoDesc = (site.seo_config?.seo_description as string) || '';
        return (
            pageSeo.description ||
            page.excerpt ||
            seoDesc ||
            site.description ||
            ''
        );
    }, [
        seo?.description,
        pageSeo.description,
        page.excerpt,
        site.seo_config,
        site.description,
    ]);

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            seo={seo}
            pageTitle={seoTitle}
            pageDescription={seoDescription}
            breadcrumbs={breadcrumbs}
        >
            <article className="w-full">
                {/* Main Image */}
                {page.image && (
                    <div className="mb-8">
                        <img
                            src={page.image}
                            alt={page.title}
                            className="h-64 w-full rounded-lg object-cover shadow-md md:h-96"
                            loading="eager"
                        />
                    </div>
                )}

                {/* Page Header */}
                <header className="mb-8">
                    <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                        {page.title}
                    </h1>
                    {page.excerpt && (
                        <p className="text-xl leading-relaxed text-muted-foreground">
                            {page.excerpt}
                        </p>
                    )}
                </header>

                {/* Page Content */}
                <div className="mb-8">{renderedContent}</div>

                {/* Additional Images */}
                {renderedImages}

                {/* Children Pages */}
                {renderedChildren}
            </article>
        </MainLayout>
    );
};

export default SitePageShow;
