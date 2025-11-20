import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import React from 'react';

// Расширенный тип для поддержки разных форматов breadcrumbs
type BreadcrumbItemExtended =
    | BreadcrumbItemType
    | {
          title: string;
          url?: string;
          href?: string;
          slug?: string;
      };

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbItemExtended[];
    className?: string;
    variant?: 'default' | 'simple';
}

export function Breadcrumbs({
    breadcrumbs,
    className = '',
    variant = 'default',
}: BreadcrumbsProps) {
    // Нормализуем breadcrumbs для единообразной обработки
    // Хуки должны вызываться до любого условного возврата
    const normalizedBreadcrumbs = React.useMemo(() => {
        return breadcrumbs.map((item) => {
            // Поддерживаем как href, так и url
            let href = '';
            if ('href' in item && item.href) {
                href = item.href;
            } else if ('url' in item && item.url) {
                href = item.url;
            }
            return {
                title: item.title,
                href: href,
            };
        });
    }, [breadcrumbs]);

    if (breadcrumbs.length === 0) return null;

    if (variant === 'simple') {
        return (
            <nav
                className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
            >
                {normalizedBreadcrumbs.map((item, index) => {
                    const isLast = index === normalizedBreadcrumbs.length - 1;
                    const href =
                        item.href && item.href !== '' && !isLast
                            ? item.href
                            : null;

                    return (
                        <React.Fragment key={index}>
                            {index > 0 && <span>/</span>}
                            {href ? (
                                <Link
                                    href={href}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {item.title}
                                </Link>
                            ) : (
                                <span className="font-medium text-foreground">
                                    {item.title}
                                </span>
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>
        );
    }

    return (
        <nav className={`breadcrumbs flex items-center gap-2 ${className}`}>
            {normalizedBreadcrumbs.map((item, index) => {
                const isLast = index === normalizedBreadcrumbs.length - 1;
                const href =
                    item.href && item.href !== '' && !isLast ? item.href : null;

                return (
                    <div
                        key={index}
                        className="breadcrumbs__item flex items-center gap-2"
                    >
                        {href ? (
                            <>
                                <Link href={href} className="breadcrumbs__link">
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
