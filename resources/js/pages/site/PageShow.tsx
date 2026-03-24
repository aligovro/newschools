import type {
    WidgetData,
    WidgetPosition,
} from '@/components/dashboard/site-builder/types';
import { AboutAnchorNav } from '@/components/site/AboutAnchorNav';
import { AboutValuesCards } from '@/components/site/AboutValuesCards';
import MainLayout from '@/layouts/MainLayout';
import {
    getAboutLayout,
    getAboutLayoutForPage,
    resolveAboutAnchors,
} from '@/lib/aboutPageLayout';
import { type BreadcrumbItem } from '@/types';
import { getImageUrl } from '@/utils/getImageUrl';
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
    /** Собственные стили сайта (например после миграции с другого домена) */
    custom_css?: string | null;
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
    layout_config?: Record<string, unknown>;
}

interface PageSeo {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
}

interface PageShowProps {
    site: Site;
    page: Page | null;
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
    // Мемоизируем рендер контента страницы
    const renderedContent = useMemo(() => {
        if (!page?.content) return null;

        if (page.content.includes('<')) {
            return (
                <div
                    className="page-content-html"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            );
        }

        return (
            <div className="prose prose-gray max-w-none">
                {page.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                        {paragraph || '\u00A0'}
                    </p>
                ))}
            </div>
        );
    }, [page?.content]);

    // Мемоизируем дополнительные изображения
    const renderedImages = useMemo(() => {
        if (!page?.images || page.images.length === 0) return null;

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
    }, [page?.images, page?.title]);

    // Мемоизируем дочерние страницы
    const renderedChildren = useMemo(() => {
        if (!page?.children || page.children.length === 0) return null;

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
    }, [page?.children]);

    // Для главной страницы и отсутствующей страницы хлебных крошек нет
    const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
        if (!page || page.is_homepage) return [];

        const items: BreadcrumbItem[] = [{ title: 'Главная', href: '/' }];

        if (page.parent) {
            items.push({ title: page.parent.title, href: `/${page.parent.slug}` });
        }

        items.push({ title: page.title, href: '' });

        return items;
    }, [page]);

    // SEO: приоритет серверным данным, иначе fallback
    const seoTitle = useMemo(() => {
        if (seo?.title) return seo.title;
        if (!page || page.is_homepage) {
            return pageSeo.title || (site.seo_config?.site_name as string) || site.name;
        }
        return pageSeo.title || `${page.title} - ${site.name}`;
    }, [seo?.title, page, pageSeo.title, site.name, site.seo_config]);

    const seoDescription = useMemo(() => {
        if (seo?.description) return seo.description;
        const seoDesc = (site.seo_config?.seo_description as string) || '';
        return pageSeo.description || page?.excerpt || seoDesc || site.description || '';
    }, [seo?.description, pageSeo.description, page?.excerpt, site.seo_config, site.description]);

    const isSchoolAbout =
        site.template === 'school' && page?.template === 'about';

    const storedAboutLayout = useMemo(
        () => (isSchoolAbout ? getAboutLayout(page?.layout_config) : null),
        [isSchoolAbout, page?.layout_config],
    );

    const aboutLayout = useMemo(
        () =>
            isSchoolAbout
                ? getAboutLayoutForPage(page?.layout_config, {
                      isSchoolAbout: true,
                  })
                : null,
        [isSchoolAbout, page?.layout_config],
    );

    const missionTitle =
        aboutLayout?.mission?.title?.trim() || 'Наша миссия';
    const missionBody = aboutLayout?.mission?.body?.trim() || '';
    const missionImage = aboutLayout?.mission?.image?.trim() || '';
    const imagePosition = aboutLayout?.mission?.imagePosition || 'left';
    const valueCards = aboutLayout?.values?.filter((v) => v.title?.trim()) ?? [];
    const showMissionBlock = Boolean(
        missionBody ||
            missionImage ||
            storedAboutLayout?.mission?.title?.trim(),
    );
    const showValuesSection = valueCards.length > 0;

    const aboutAnchorItems = useMemo(() => {
        const items = resolveAboutAnchors(aboutLayout);
        if (!showValuesSection) {
            return items.filter((i) => i.id !== 'values');
        }
        return items;
    }, [aboutLayout, showValuesSection]);

    const missionBodyNode = useMemo(() => {
        if (!missionBody) return null;
        if (missionBody.includes('<')) {
            return (
                <div
                    className="school-about-mission__body page-content-html"
                    dangerouslySetInnerHTML={{ __html: missionBody }}
                />
            );
        }
        return (
            <div className="school-about-mission__body whitespace-pre-wrap">
                {missionBody}
            </div>
        );
    }, [missionBody]);

    /** По макету вводный текст только в герое (слева от картинки): сначала excerpt, иначе основной контент страницы. */
    const schoolAboutHeroIntro = useMemo(() => {
        if (!page) return null;
        const ex = page.excerpt?.trim();
        const ct = page.content?.trim();
        const raw = ex || ct;
        if (!raw) return null;
        const html = ex ? ex : ct!;
        if (html.includes('<')) {
            return (
                <div
                    className="school-about-hero__lead page-content-html"
                    dangerouslySetInnerHTML={{
                        __html: ex ? page.excerpt! : page.content!,
                    }}
                />
            );
        }
        return (
            <p className="school-about-hero__lead whitespace-pre-wrap">{raw}</p>
        );
    }, [page]);

    const hasSchoolAboutIntro = Boolean(
        page?.excerpt?.trim() || page?.content?.trim(),
    );

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageContext={page}
            seo={seo}
            pageTitle={seoTitle}
            pageDescription={seoDescription}
            breadcrumbs={breadcrumbs}
        >
            {/* Нет страницы или страница с is_homepage: только виджеты, без article/header */}
            {page && !page.is_homepage && (
                <article className="w-full">
                    {isSchoolAbout ? (
                        <div className="school-about-page school-p-lr-60">
                            <header
                                className="school-about-hero"
                                id="activity"
                            >
                                <div className="school-about-hero__text">
                                    <h1 className="school-about-hero__title">
                                        {page.title}
                                    </h1>
                                    {schoolAboutHeroIntro}
                                </div>
                                {page.image ? (
                                    <div className="school-about-hero__media">
                                        <img
                                            src={page.image}
                                            alt=""
                                            className="school-about-hero__image"
                                            loading="eager"
                                        />
                                    </div>
                                ) : null}
                            </header>

                            <AboutAnchorNav items={aboutAnchorItems} />

                            {showMissionBlock && (
                                <section
                                    id="mission"
                                    className="school-about-section school-about-section--mission"
                                >
                                    <div
                                        className={`school-about-mission ${
                                            imagePosition === 'right'
                                                ? 'school-about-mission--image-right'
                                                : ''
                                        }`}
                                    >
                                        {missionImage ? (
                                            <figure className="school-about-mission__figure">
                                                <img
                                                    src={getImageUrl(missionImage)}
                                                    alt=""
                                                    className="school-about-mission__image"
                                                    loading="lazy"
                                                />
                                            </figure>
                                        ) : null}
                                        <div className="school-about-mission__text">
                                            <h2 className="school-about-mission__title">
                                                {missionTitle}
                                            </h2>
                                            {missionBodyNode}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {showValuesSection && (
                                <section
                                    id="values"
                                    className="school-about-section school-about-section--values"
                                    aria-labelledby="values-heading"
                                >
                                    <AboutValuesCards cards={valueCards} />
                                </section>
                            )}

                            {!showMissionBlock &&
                                !showValuesSection &&
                                !hasSchoolAboutIntro &&
                                !page.image && (
                                    <div className="py-12 text-center">
                                        <div className="text-muted-foreground">
                                            <p className="mb-2 text-lg">
                                                Содержимое страницы отсутствует
                                            </p>
                                            <p className="text-sm">
                                                Заполните блоки в настройках
                                                страницы или текст контента.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {renderedImages}
                            {renderedChildren}
                        </div>
                    ) : (
                        <>
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

                            <div className="mb-8">
                                {renderedContent ?? (
                                    <div className="py-12 text-center">
                                        <div className="text-muted-foreground">
                                            <p className="mb-2 text-lg">
                                                Содержимое страницы отсутствует
                                            </p>
                                            <p className="text-sm">
                                                Эта страница еще не содержит
                                                контента.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {renderedImages}
                            {renderedChildren}
                        </>
                    )}
                </article>
            )}

            {/* Главная страница с is_homepage: только HTML-контент, без article/header */}
            {page?.is_homepage && renderedContent}
        </MainLayout>
    );
};

export default SitePageShow;
