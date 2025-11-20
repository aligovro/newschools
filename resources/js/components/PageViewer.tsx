import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import PageNavigation from './PageNavigation';

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
    image?: string;
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

interface PageViewerProps {
    organization: Organization;
    page: Page;
    navigationPages?: Page[];
}

const PageViewer: React.FC<PageViewerProps> = ({
    organization,
    page,
    navigationPages = [],
}) => {
    const { props } = usePage();
    const terminology = (props as any).terminology || {
        organization: { singular_nominative: 'Организация' },
    };

    const renderContent = () => {
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

        // Простой рендер контента (можно расширить для поддержки Markdown, HTML и т.д.)
        return (
            <div className="prose prose-gray max-w-none">
                {page.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                        {paragraph || '\u00A0'}{' '}
                        {/* Неразрывный пробел для пустых абзацев */}
                    </p>
                ))}
            </div>
        );
    };

    const getTemplateClass = (template: string) => {
        const templateClasses = {
            default: 'max-w-4xl mx-auto',
            'full-width': 'w-full',
            landing: 'max-w-6xl mx-auto',
            blog: 'max-w-3xl mx-auto',
            contact: 'max-w-2xl mx-auto',
            about: 'max-w-3xl mx-auto',
        };

        return (
            templateClasses[template as keyof typeof templateClasses] ||
            templateClasses.default
        );
    };

    const hasSidebar = navigationPages.length > 0;
    const gridTemplateClass = hasSidebar
        ? 'lg:grid-cols-[minmax(360px,1fr)_repeat(3,minmax(0,1fr))]'
        : 'lg:grid-cols-4';
    const gridClassName = `grid grid-cols-1 gap-8 lg:gap-24 ${gridTemplateClass}`;
    const mainColumnClass = hasSidebar ? 'lg:col-span-3' : 'lg:col-span-4';

    return (
        <>
            <Head>
                <title>
                    {page.seo_title || page.title} - {organization.name}
                </title>
                {page.seo_description && (
                    <meta name="description" content={page.seo_description} />
                )}
                {page.seo_keywords && (
                    <meta name="keywords" content={page.seo_keywords} />
                )}
                {page.seo_image && (
                    <meta property="og:image" content={page.seo_image} />
                )}
                <meta property="og:title" content={page.title} />
                <meta
                    property="og:description"
                    content={page.excerpt || page.seo_description}
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={page.url} />
            </Head>

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
                    <div className="container mx-auto py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {organization.logo && (
                                    <img
                                        src={organization.logo}
                                        alt={organization.name}
                                        className="h-8 w-8 rounded"
                                    />
                                )}
                                <div>
                                    <h1 className="text-xl font-bold">
                                        {organization.name}
                                    </h1>
                                    {organization.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {organization.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline">{page.template}</Badge>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto">
                    <div className={gridClassName}>
                        {/* Navigation Sidebar */}
                        {hasSidebar && (
                            <aside className="lg:col-span-1">
                                <PageNavigation
                                    pages={navigationPages}
                                    currentPageId={page.id}
                                    organizationDomain={organization.domain}
                                />
                            </aside>
                        )}

                        {/* Main Content */}
                        <main className={mainColumnClass}>
                            <div className={getTemplateClass(page.template)}>
                                {/* Breadcrumbs */}
                                {page.breadcrumbs &&
                                    page.breadcrumbs.length > 1 && (
                                        <Breadcrumbs
                                            breadcrumbs={page.breadcrumbs}
                                            variant="simple"
                                            className="mb-6"
                                        />
                                    )}

                                {/* Image */}
                                {page.image && (
                                    <div className="mb-8">
                                        <img
                                            src={page.image}
                                            alt={page.title}
                                            className="h-64 w-full rounded-lg object-cover shadow-md md:h-96"
                                        />
                                    </div>
                                )}

                                {/* Page Header */}
                                <div className="mb-8">
                                    <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                                        {page.title}
                                    </h1>
                                    {page.excerpt && (
                                        <p className="text-xl leading-relaxed text-muted-foreground">
                                            {page.excerpt}
                                        </p>
                                    )}
                                </div>

                                {/* Page Content */}
                                <Card>
                                    <CardContent className="pt-6">
                                        {renderContent()}
                                    </CardContent>
                                </Card>

                                {/* Page Footer */}
                                <div className="mt-8 border-t pt-8">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div>
                                            <p>
                                                {terminology.organization
                                                    ?.singular_nominative ||
                                                    'Организация'}
                                                : {organization.name}
                                            </p>
                                            {page.published_at && (
                                                <p>
                                                    Опубликовано:{' '}
                                                    {new Date(
                                                        page.published_at,
                                                    ).toLocaleDateString(
                                                        'ru-RU',
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <p>
                                                Обновлено:{' '}
                                                {new Date(
                                                    page.updated_at,
                                                ).toLocaleDateString('ru-RU')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-muted/50 mt-16 border-t">
                    <div className="container mx-auto">
                        <div className="text-center text-muted-foreground">
                            <p>
                                &copy; {new Date().getFullYear()}{' '}
                                {organization.name}. Все права защищены.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default PageViewer;
