import MainLayout from '@/layouts/MainLayout';

interface IndexPageProps {
    site: any;
    positions: any[];
    position_settings?: any[];
    seo?: any;
}

export default function Index({
    site,
    positions,
    position_settings = [],
    seo,
}: IndexPageProps) {
    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            seo={seo}
        >
            {/* Контент главной страницы рендерится через виджеты в позициях MainLayout */}
        </MainLayout>
    );
}

