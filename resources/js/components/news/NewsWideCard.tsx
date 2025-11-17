import ShareButton from '@/components/ui/ShareButton';
import { Link } from '@inertiajs/react';
import { ArrowRight, Calendar } from 'lucide-react';

export interface NewsSummary {
    id: number;
    title: string;
    slug: string;
    subtitle?: string | null;
    excerpt?: string | null;
    image?: string | null;
    published_at?: string | null;
    type?: string | null;
    tags?: string[];
    organization?: {
        name: string;
        slug?: string;
    } | null;
}

interface NewsWideCardProps {
    news: NewsSummary;
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

export default function NewsWideCard({ news }: NewsWideCardProps) {
    const formattedDate = formatDate(news.published_at);
    const newsUrl = `/news/${news.slug}`;

    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md lg:flex-row">
            <Link
                href={newsUrl}
                className="relative block h-56 flex-shrink-0 overflow-hidden bg-gray-100 lg:h-auto lg:w-2/5"
            >
                {news.image ? (
                    <img
                        src={news.image}
                        alt={news.title}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-4xl font-semibold text-slate-500">
                        {news.title.charAt(0)}
                    </div>
                )}
            </Link>

            <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {formattedDate && (
                        <span className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formattedDate}
                        </span>
                    )}
                    {news.type && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                            {news.type === 'event'
                                ? 'Событие'
                                : news.type === 'announcement'
                                  ? 'Анонс'
                                  : 'Новость'}
                        </span>
                    )}
                </div>

                <div>
                    <Link href={newsUrl}>
                        <h3 className="text-2xl font-semibold text-gray-900">
                            {news.title}
                        </h3>
                    </Link>
                    {news.subtitle && (
                        <p className="mt-2 text-sm font-medium uppercase tracking-wide text-gray-500">
                            {news.subtitle}
                        </p>
                    )}
                </div>

                {news.excerpt && (
                    <p className="text-base leading-relaxed text-gray-600">
                        {news.excerpt}
                    </p>
                )}

                {news.tags && news.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {news.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-4">
                    {news.organization?.name && (
                        <Link
                            href={
                                news.organization.slug
                                    ? `/organization/${news.organization.slug}`
                                    : '#'
                            }
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                            {news.organization.name}
                        </Link>
                    )}
                    <div className="flex-1" />
                    <ShareButton url={newsUrl} />
                    <Link
                        href={newsUrl}
                        className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        Читать
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </article>
    );
}

