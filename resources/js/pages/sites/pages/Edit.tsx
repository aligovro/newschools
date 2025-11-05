import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import SitePageForm from '@/components/dashboard/pages/sites/SitePageForm';

interface Site {
    id: number;
    name: string;
    slug: string;
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
    parent_id?: number;
    sort_order: number;
    image?: string;
    images?: string[];
    published_at?: string;
    created_at: string;
    updated_at: string;
}

interface ParentPage {
    id: number;
    title: string;
    slug: string;
}

interface Props {
    site: Site;
    page: Page;
    parentPages: ParentPage[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Сайты', href: '/dashboard/sites' },
];

export default function EditSitePage({
    site,
    page,
    parentPages,
}: Props) {
    const pageBreadcrumbs: BreadcrumbItem[] = [
        ...breadcrumbs,
        { title: site.name, href: `/dashboard/sites/${site.id}` },
        { title: 'Страницы', href: `/dashboard/sites/${site.id}/pages` },
        { title: page.title, href: `/dashboard/sites/${site.id}/pages/${page.id}` },
        { title: 'Редактировать' },
    ];

    return (
        <AppLayout breadcrumbs={pageBreadcrumbs}>
            <Head title={`Редактировать страницу - ${page.title}`} />
            <div className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                    <Link href={`/dashboard/sites/${site.id}/pages/${page.id}`}>
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">
                            Редактировать страницу
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Редактирование страницы "{page.title}"
                        </p>
                    </div>
                </div>
                <SitePageForm
                    mode="edit"
                    site={site}
                    page={page}
                    parentPages={parentPages}
                />
            </div>
        </AppLayout>
    );
}

