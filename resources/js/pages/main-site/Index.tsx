import MainLayout from '@/layouts/MainLayout';

interface IndexPageProps {
    site: any;
    positions: any[];
    position_settings?: any[];
}

export default function Index({
    site,
    positions,
    position_settings = [],
}: IndexPageProps) {
    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
        >
            {/* Контент главной страницы рендерится через виджеты в позициях MainLayout */}
        </MainLayout>
    );
}

