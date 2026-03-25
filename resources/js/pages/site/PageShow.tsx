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
import { ContactMapModal } from '@/components/ui/ContactMapModal';
import { FileText } from 'lucide-react';
import React, { useMemo, useState } from 'react';

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
    /** false — не выводим h1 на сайте (slug/SEO заголовок в админке сохраняются) */
    show_title?: boolean;
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

/** Типовая CMS-страница (не спец. шаблоны about/thanks/contact) — один разметочный источник для school и остальных. */
function DefaultCmsPageSection({
    page,
    renderedContent,
    renderedImages,
    renderedChildren,
}: {
    page: Page;
    renderedContent: React.ReactNode;
    renderedImages: React.ReactNode;
    renderedChildren: React.ReactNode;
}) {
    const showHeading = page.show_title !== false;
    const hasMainContent = Boolean(renderedContent);
    const hasBelowHeader =
        hasMainContent || Boolean(renderedImages || renderedChildren);
    const showHeaderBlock =
        showHeading || Boolean(page.excerpt?.trim());

    return (
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

            {showHeaderBlock && (
                <header
                    className={
                        page.excerpt || hasBelowHeader ? 'mb-8' : undefined
                    }
                >
                    {showHeading && (
                        <h1
                            className={
                                page.excerpt || hasBelowHeader
                                    ? 'mb-4 text-4xl font-bold tracking-tight md:text-5xl'
                                    : 'text-4xl font-bold tracking-tight md:text-5xl'
                            }
                        >
                            {page.title}
                        </h1>
                    )}
                    {page.excerpt && (
                        <p className="text-xl leading-relaxed text-muted-foreground">
                            {page.excerpt}
                        </p>
                    )}
                </header>
            )}

            {hasMainContent && (
                <div className="mb-8">{renderedContent}</div>
            )}

            {renderedImages}
            {renderedChildren}
        </>
    );
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

    const isSchoolThanks =
        site.template === 'school' && page?.template === 'thanks';

    const isSchoolContacts =
        site.template === 'school' && page?.template === 'contact';

    const thanksLayout = useMemo(() => {
        if (!isSchoolThanks) return null;
        const lc = page?.layout_config || {};
        const t = (
            typeof lc.thanks === 'object' && lc.thanks !== null
                ? lc.thanks
                : {}
        ) as {
            collected_amount?: string;
            profile_link_text?: string;
            profile_url?: string;
            cta_text?: string;
            cta_url?: string;
            requisites_url?: string;
        };
        return {
            collected_amount: String(t.collected_amount ?? ''),
            profile_link_text: String(
                t.profile_link_text ??
                    'Подписку можно настроить в личном кабинете',
            ),
            profile_url: String(t.profile_url ?? '/my-account'),
            cta_text: String(t.cta_text ?? 'Перейти на главную'),
            cta_url: String(t.cta_url ?? '/'),
            requisites_url: String(t.requisites_url ?? ''),
        };
    }, [isSchoolThanks, page?.layout_config]);

    type SocialKey = 'vk' | 'telegram' | 'whatsapp' | 'max' | 'youtube';
    type ContactCard = {
        label?: string;
        value?: string;
        hours?: string;
        email?: string;
        action_text?: string;
        action_url?: string;
        action_variant?: 'primary' | 'outline';
        map_enabled?: boolean;
        socials?: Partial<Record<SocialKey, { enabled?: boolean; url?: string }>>;
    };
    type ContactDoc = {
        name?: string;
        url?: string;
        meta?: string;
    };

    const contactsLayout = useMemo(() => {
        if (!isSchoolContacts) return null;
        const lc = page?.layout_config || {};
        const c = (
            typeof lc.contacts === 'object' && lc.contacts !== null
                ? lc.contacts
                : {}
        ) as {
            cards?: ContactCard[];
            documents?: ContactDoc[];
            docs_title?: string;
        };
        return {
            cards: Array.isArray(c.cards) ? c.cards : [],
            documents: Array.isArray(c.documents) ? c.documents : [],
            docs_title: String(c.docs_title ?? 'Официальные документы'),
        };
    }, [isSchoolContacts, page?.layout_config]);

    // Индекс карточки, для которой открыта карта (null = закрыта)
    const [mapCardIdx, setMapCardIdx] = useState<number | null>(null);

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
                                    {page.show_title !== false && (
                                        <h1 className="school-about-hero__title">
                                            {page.title}
                                        </h1>
                                    )}
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

                            {renderedImages}
                            {renderedChildren}
                        </div>
                    ) : isSchoolThanks ? (
                        <div className="school-thanks-page school-p-lr-60">
                            <div className="school-thanks-hero">
                                <div className="school-thanks-hero__text">
                                    {page.show_title !== false && (
                                        <h1 className="school-thanks-hero__title">
                                            {page.title}
                                        </h1>
                                    )}
                                    {page.excerpt && (
                                        <p className="school-thanks-hero__lead">
                                            {page.excerpt}
                                        </p>
                                    )}
                                    <hr className="school-thanks-hero__divider" />
                                    <a
                                        href={thanksLayout!.profile_url}
                                        className="school-thanks-hero__profile"
                                    >
                                        <img
                                            src="/icons/school-template/profile-circle.svg"
                                            alt=""
                                            className="school-thanks-hero__profile-icon"
                                        />
                                        <span>
                                            {thanksLayout!.profile_link_text}
                                        </span>
                                    </a>
                                    <a
                                        href={thanksLayout!.cta_url}
                                        className="school-thanks-hero__cta"
                                    >
                                        {thanksLayout!.cta_text}
                                    </a>
                                    {thanksLayout!.requisites_url && (
                                        <a
                                            href={
                                                thanksLayout!.requisites_url
                                            }
                                            className="school-thanks-hero__requisites"
                                        >
                                            Скачать реквизиты школы
                                        </a>
                                    )}
                                </div>
                                <div className="school-thanks-hero__media">
                                    <div className="school-thanks-gallery">
                                        <div className="school-thanks-gallery__a">
                                            <div className="school-thanks-stat">
                                                <div className="school-thanks-stat__icon">
                                                    <img
                                                        src="/icons/school-template/lovely.svg"
                                                        alt=""
                                                        width={66}
                                                        height={66}
                                                    />
                                                </div>
                                                <div className="school-thanks-stat__text">
                                                    {thanksLayout!
                                                        .collected_amount && (
                                                        <span className="school-thanks-stat__amount">
                                                            {
                                                                thanksLayout!
                                                                    .collected_amount
                                                            }
                                                        </span>
                                                    )}
                                                    <span className="school-thanks-stat__label">
                                                        Сумма оказанной
                                                        <br />
                                                        помощи
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="school-thanks-gallery__bottom">
                                                {page.images?.[1] && (
                                                    <img
                                                        src={page.images[1]}
                                                        alt=""
                                                        className="school-thanks-gallery__img school-thanks-gallery__img--2"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <div className="school-thanks-gallery__gray" />
                                            </div>
                                        </div>
                                        <div className="school-thanks-gallery__b">
                                            {page.images?.[0] && (
                                                <img
                                                    src={page.images[0]}
                                                    alt=""
                                                    className="school-thanks-gallery__img school-thanks-gallery__img--1"
                                                    loading="lazy"
                                                />
                                            )}
                                            {page.images?.[2] && (
                                                <img
                                                    src={page.images[2]}
                                                    alt=""
                                                    className="school-thanks-gallery__img school-thanks-gallery__img--3"
                                                    loading="lazy"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : isSchoolContacts ? (
                        <div className="school-contacts-page school-p-lr-60">
                            {page.show_title !== false && (
                                <h1 className="school-contacts-hero__title">
                                    {page.title}
                                </h1>
                            )}

                            {contactsLayout!.cards.length > 0 && (
                                <div className="school-contacts-grid">
                                    {contactsLayout!.cards.map((card, i) => (
                                        <div
                                            key={i}
                                            className="school-contacts-card"
                                        >
                                            {card.label && (
                                                <div className="school-contacts-card__label">
                                                    {card.label}
                                                </div>
                                            )}
                                            {card.value && (
                                                <div className="school-contacts-card__value">
                                                    {card.value}
                                                </div>
                                            )}
                                            {card.hours && (
                                                <div className="school-contacts-card__hours">
                                                    {card.hours}
                                                </div>
                                            )}
                                            {card.email && (
                                                <a
                                                    href={`mailto:${card.email}`}
                                                    className="school-contacts-card__email"
                                                >
                                                    {card.email}
                                                </a>
                                            )}
                                            {(() => {
                                                const hasAction = !!(card.action_text && card.action_url);
                                                const hasMap = !!(card.map_enabled && card.value);
                                                const activeSocials = (['vk', 'telegram', 'whatsapp', 'max', 'youtube'] as SocialKey[]).filter(
                                                    (net) => card.socials?.[net]?.enabled && card.socials[net]?.url,
                                                );
                                                if (!hasAction && !hasMap && activeSocials.length === 0) return null;
                                                return (
                                                    <div className="school-contacts-card__footer">
                                                        {hasAction && (
                                                            <a
                                                                href={card.action_url!}
                                                                className={`school-contacts-card__btn school-contacts-card__btn--${card.action_variant || 'primary'}`}
                                                            >
                                                                {card.action_text}
                                                            </a>
                                                        )}
                                                        {hasMap && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setMapCardIdx(i)}
                                                                className="school-contacts-card__btn school-contacts-card__btn--outline"
                                                            >
                                                                Открыть на карте
                                                            </button>
                                                        )}
                                                        {activeSocials.length > 0 && (
                                                            <div className="school-contacts-card__socials">
                                                                {activeSocials.map((net) => {
                                                                    const url = card.socials![net]!.url!;
                                                                    return (
                                                                        <a
                                                                            key={net}
                                                                            href={url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="school-contacts-card__social-btn"
                                                                            title={net}
                                                                        >
                                                                            <img
                                                                                src={`/icons/school-template/${net}.svg`}
                                                                                alt={net}
                                                                                width={20}
                                                                                height={20}
                                                                            />
                                                                        </a>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {contactsLayout!.documents.length > 0 && (
                                <div className="school-contacts-docs">
                                    <h2 className="school-contacts-docs__title">
                                        {contactsLayout!.docs_title}
                                    </h2>
                                    <div className="school-contacts-docs__list">
                                        {contactsLayout!.documents.map(
                                            (doc, i) => (
                                                <div
                                                    key={i}
                                                    className="school-contacts-doc"
                                                >
                                                    <div className="school-contacts-doc__icon">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div className="school-contacts-doc__info">
                                                        {doc.meta && (
                                                            <span className="school-contacts-doc__meta">
                                                                {doc.meta}
                                                            </span>
                                                        )}
                                                        {doc.name && (
                                                            <span className="school-contacts-doc__name">
                                                                {doc.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {doc.url && (
                                                        <a
                                                            href={doc.url}
                                                            className="school-contacts-doc__btn"
                                                            download
                                                        >
                                                            Скачать
                                                        </a>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Модалка карты — рендерится только при открытии, сам инициирует геокодинг */}
                            {mapCardIdx !== null && contactsLayout!.cards[mapCardIdx] && (
                                <ContactMapModal
                                    open
                                    address={contactsLayout!.cards[mapCardIdx].value ?? ''}
                                    label={contactsLayout!.cards[mapCardIdx].label}
                                    onClose={() => setMapCardIdx(null)}
                                />
                            )}
                        </div>
                    ) : site.template === 'school' ? (
                        <div className="school-cms-page">
                            <DefaultCmsPageSection
                                page={page}
                                renderedContent={renderedContent}
                                renderedImages={renderedImages}
                                renderedChildren={renderedChildren}
                            />
                        </div>
                    ) : (
                        <DefaultCmsPageSection
                            page={page}
                            renderedContent={renderedContent}
                            renderedImages={renderedImages}
                            renderedChildren={renderedChildren}
                        />
                    )}
                </article>
            )}

            {/* Главная страница с is_homepage: только HTML-контент, без article/header */}
            {page?.is_homepage && renderedContent}
        </MainLayout>
    );
};

export default SitePageShow;
