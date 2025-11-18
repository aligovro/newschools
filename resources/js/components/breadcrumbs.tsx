import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbItemType[];
}

export function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
    if (breadcrumbs.length === 0) return null;

    return (
        <nav className="breadcrumbs">
            {/* <Link
                href="/"
                className="flex items-center transition-colors hover:text-gray-900"
            >
                <Home className="h-4 w-4" />
            </Link> */}
            {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                    <div key={index} className="breadcrumbs__item">
                        {item.href && item.href !== '' && !isLast ? (
                            <>
                                <Link
                                    href={item.href}
                                    className="breadcrumbs__link"
                                >
                                    {item.title}
                                </Link>
                                <ChevronRight className="breadcrumbs__separator" />
                            </>
                        ) : (
                            <span className="breadcrumbs__current">
                                {item.title}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
