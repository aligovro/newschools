import SitePageForm from '@/components/dashboard/pages/sites/SitePageForm';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Site {
    id: number;
    name: string;
    slug: string;
}

interface ParentPage {
    id: number;
    title: string;
    slug: string;
}

interface Props {
    site: Site;
    parentPages: ParentPage[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Админ панель', href: '/dashboard' },
    { title: 'Сайты', href: '/dashboard/sites' },
];

export default function CreateSitePage({ site, parentPages }: Props) {
    const pageBreadcrumbs: BreadcrumbItem[] = [
        ...breadcrumbs,
        { title: site.name, href: `/dashboard/sites/${site.id}` },
        { title: 'Страницы', href: `/dashboard/sites/${site.id}/pages` },
        {
            title: 'Создать страницу',
            href: '',
        },
    ];

    return (
        <AppLayout breadcrumbs={pageBreadcrumbs}>
            <Head title={`Создать страницу - ${site.name}`} />
            <div className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                    <Link href={`/dashboard/sites/${site.id}/pages`}>
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">
                            Создать страницу
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Создать новую страницу для сайта "{site.name}"
                        </p>
                    </div>
                </div>
                <SitePageForm
                    mode="create"
                    site={site}
                    parentPages={parentPages}
                />
            </div>
        </AppLayout>
    );
}
