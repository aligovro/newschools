import ShareButton from '@/components/ui/ShareButton';
import { cn } from '@/lib/utils';
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
    /** Компактная карточка и токены шаблона school (только сайт организации) */
    variant?: 'default' | 'school';
    /** Не показывать ссылку на организацию (уже в контексте сайта организации) */
    hideOrganizationLink?: boolean;
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

export default function NewsWideCard({
    news,
    variant = 'default',
    hideOrganizationLink = false,
}: NewsWideCardProps) {
    const formattedDate = formatDate(news.published_at);
    const newsUrl = `/news/${news.slug}`;
    const isSchool = variant === 'school';

    return (
        <article
            className={cn(
                'overflow-hidden border border-gray-200 bg-white shadow-sm transition hover:shadow-md',
                isSchool
                    ? 'school-news-card flex flex-col rounded-[22px]'
                    : 'flex flex-col rounded-2xl lg:flex-row',
            )}
        >
            <Link
                href={newsUrl}
                className={cn(
                    'relative block flex-shrink-0 overflow-hidden bg-gray-100',
                    isSchool
                        ? 'school-news-card__media'
                        : 'h-56 lg:h-auto lg:w-2/5',
                )}
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

            <div
                className={cn(
                    'flex flex-1 flex-col',
                    isSchool
                        ? 'school-news-card__body min-h-0 gap-3 p-4'
                        : 'gap-4 p-6',
                )}
            >
                <div
                    className={cn(
                        'flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500',
                        isSchool && 'school-news-card__meta',
                    )}
                >
                    {formattedDate && (
                        <span className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formattedDate}
                        </span>
                    )}
                    {news.type && !isSchool && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                            {news.type === 'event'
                                ? 'Событие'
                                : news.type === 'announcement'
                                  ? 'Анонс'
                                  : 'Новость'}
                        </span>
                    )}
                </div>

                <div
                    className={cn(isSchool && 'school-news-card__head flex-shrink-0')}
                >
                    <Link href={newsUrl}>
                        <h3
                            className={cn(
                                'font-semibold text-gray-900',
                                isSchool
                                    ? 'school-news-card__heading'
                                    : 'text-2xl',
                            )}
                        >
                            {news.title}
                        </h3>
                    </Link>
                    {news.subtitle && (
                        <p
                            className={cn(
                                'mt-2 text-sm font-medium uppercase tracking-wide text-gray-500',
                                isSchool && 'school-news-card__subtitle',
                            )}
                        >
                            {news.subtitle}
                        </p>
                    )}
                </div>

                {isSchool &&
                (news.excerpt ||
                    (news.tags && news.tags.length > 0)) ? (
                    <div className="school-news-card__main-text min-h-0 flex-1">
                        {news.excerpt && (
                            <p className="school-news-card__excerpt text-sm leading-relaxed text-gray-600">
                                {news.excerpt}
                            </p>
                        )}
                        {news.tags && news.tags.length > 0 && (
                            <div className="mt-2 flex min-h-0 flex-wrap gap-1.5">
                                {news.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ) : !isSchool ? (
                    <>
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
                    </>
                ) : null}

                <div
                    className={cn(
                        'mt-auto flex flex-wrap items-center gap-4',
                        isSchool && 'school-news-card__footer',
                    )}
                >
                    {news.organization?.name && !hideOrganizationLink && (
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
