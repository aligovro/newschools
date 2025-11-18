import { GalleryModal } from '@/components/main-site/GalleryModal';
import { GallerySlider } from '@/components/main-site/GallerySlider';
import ShareButton from '@/components/ui/ShareButton';
import MainLayout from '@/layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { useMemo, useState } from 'react';

interface LayoutProps {
    site: any;
    positions: any[];
    position_settings?: any[];
}

interface NewsDetails {
    id: number;
    title: string;
    slug: string;
    subtitle?: string | null;
    excerpt?: string | null;
    content?: string | null;
    image?: string | null;
    gallery?: string[];
    type?: string | null;
    tags?: string[];
    published_at?: string | null;
    created_at?: string | null;
    organization?: {
        id: number;
        name: string;
        slug?: string;
    } | null;
    location?: {
        name?: string | null;
        address?: string | null;
    } | null;
}

interface NewsShowProps extends LayoutProps {
    news: NewsDetails;
}

const formatDate = (value?: string | null): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

export default function NewsShow({
    site,
    positions,
    position_settings = [],
    news,
}: NewsShowProps) {
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [initialSlide, setInitialSlide] = useState(0);

    const galleryImages = useMemo(() => {
        if (news.gallery && news.gallery.length > 0) {
            return news.gallery;
        }
        return news.image ? [news.image] : [];
    }, [news.gallery, news.image]);

    const formattedDate =
        formatDate(news.published_at) ?? formatDate(news.created_at);

    const openGallery = (index: number) => {
        setInitialSlide(index);
        setGalleryModalOpen(true);
    };

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle={news.title}
            pageDescription={news.excerpt}
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Новости', href: '/news' },
                { title: news.title, href: '' },
            ]}
        >
            <div className="space-y-8">
                <Link
                    href="/news"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Все новости
                </Link>

                {galleryImages.length > 1 ? (
                    <div>
                        <GallerySlider
                            images={galleryImages}
                            onImageClick={openGallery}
                        />
                        <GalleryModal
                            isOpen={galleryModalOpen}
                            images={galleryImages}
                            initialIndex={initialSlide}
                            onClose={() => setGalleryModalOpen(false)}
                        />
                    </div>
                ) : galleryImages.length === 1 ? (
                    <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
                        <img
                            src={galleryImages[0]}
                            alt={news.title}
                            className="h-96 w-full object-cover"
                        />
                    </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {formattedDate && (
                        <span className="flex items-center gap-2 font-medium">
                            <Calendar className="h-4 w-4" />
                            {formattedDate}
                        </span>
                    )}
                    {news.type && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                            {news.type === 'event'
                                ? 'Событие'
                                : news.type === 'announcement'
                                  ? 'Анонс'
                                  : 'Новость'}
                        </span>
                    )}
                    {news.tags && news.tags.length > 0 && (
                        <span className="flex items-center gap-2 text-sm text-gray-500">
                            <Tag className="h-4 w-4" />
                            {news.tags.slice(0, 3).join(', ')}
                        </span>
                    )}
                    <div className="flex-1" />
                    <ShareButton url={`/news/${news.slug}`} />
                </div>

                <header className="space-y-4">
                    <h1 className="page__title">{news.title}</h1>
                    {news.subtitle && (
                        <p className="text-lg font-medium uppercase tracking-wide text-gray-500">
                            {news.subtitle}
                        </p>
                    )}
                    {news.organization?.name && (
                        <Link
                            href={
                                news.organization.slug
                                    ? `/organization/${news.organization.slug}`
                                    : '#'
                            }
                            className="text-base font-semibold text-blue-600 hover:text-blue-700"
                        >
                            {news.organization.name}
                        </Link>
                    )}
                    {news.location?.name && (
                        <p className="text-sm text-gray-600">
                            {news.location.name}
                            {news.location.address
                                ? `, ${news.location.address}`
                                : ''}
                        </p>
                    )}
                </header>

                {news.excerpt && (
                    <p className="rounded-3xl bg-gray-50 p-6 text-lg font-medium text-gray-700">
                        {news.excerpt}
                    </p>
                )}

                {news.content && (
                    <div
                        className="prose prose-lg max-w-none prose-headings:font-semibold prose-img:rounded-2xl"
                        dangerouslySetInnerHTML={{ __html: news.content }}
                    />
                )}

                {news.tags && news.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {news.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

