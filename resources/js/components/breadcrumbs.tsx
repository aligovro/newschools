import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbItemType[];
}

export function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
    if (breadcrumbs.length === 0) return null;

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link
                href="/"
                className="flex items-center transition-colors hover:text-gray-900"
            >
                <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    {item.href &&
                    item.href !== '' &&
                    index < breadcrumbs.length - 1 ? (
                        <Link
                            href={item.href}
                            className="transition-colors hover:text-gray-900"
                        >
                            {item.title}
                        </Link>
                    ) : (
                        <span className="font-medium text-gray-900">
                            {item.title}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
