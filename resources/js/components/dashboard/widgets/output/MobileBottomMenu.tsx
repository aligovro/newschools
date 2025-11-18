import { Link, usePage } from '@inertiajs/react';
import React, { useCallback, useMemo } from 'react';
import { isInternalLink } from '@/lib/linkUtils';
import { MenuItem } from './types';

// Маппинг URL на иконки для мобильного меню
const getMobileMenuIcon = (url: string): string | null => {
    const normalizedUrl = url.toLowerCase().trim();
    if (normalizedUrl.includes('/organizations') || normalizedUrl.includes('/organisations')) {
        return '/icons/mobile-menu/schools.svg';
    }
    if (normalizedUrl.includes('/projects')) {
        return '/icons/mobile-menu/projects.svg';
    }
    if (normalizedUrl.includes('/news') || normalizedUrl.includes('/events')) {
        return '/icons/mobile-menu/news.svg';
    }
    if (normalizedUrl.includes('/reports') || normalizedUrl.includes('/report')) {
        return '/icons/mobile-menu/reports.svg';
    }
    if (normalizedUrl.includes('/profile')) {
        return '/icons/mobile-menu/profile-circle.svg';
    }
    return null;
};

interface MobileBottomMenuProps {
    items: MenuItem[];
    className?: string;
    style?: React.CSSProperties;
}

export const MobileBottomMenu: React.FC<MobileBottomMenuProps> = ({
    items,
    className,
    style,
}) => {
    const page = usePage();

    // Сортируем элементы меню для стабильного порядка при сборке
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            // Приоритет 1: сортировка по полю order или sort_order (если есть)
            const aOrder = (a as any).order ?? (a as any).sort_order;
            const bOrder = (b as any).order ?? (b as any).sort_order;
            if (aOrder !== undefined && bOrder !== undefined) {
                return Number(aOrder) - Number(bOrder);
            }
            if (aOrder !== undefined) return -1;
            if (bOrder !== undefined) return 1;

            // Приоритет 2: сортировка по id (если это числа)
            if (typeof a.id === 'number' && typeof b.id === 'number') {
                return a.id - b.id;
            }

            // Приоритет 3: сортировка по id как строкам
            return String(a.id).localeCompare(String(b.id));
        });
    }, [items]);

    // Определение активного пункта меню
    const isActiveMenuItem = useCallback(
        (url: string): boolean => {
            const currentUrl = page.url || '';
            const normalizedCurrentUrl = currentUrl.split('?')[0].toLowerCase();
            const normalizedItemUrl = url.split('?')[0].toLowerCase();

            // Точное совпадение
            if (normalizedCurrentUrl === normalizedItemUrl) {
                return true;
            }

            // Проверка начала пути для подстраниц
            if (normalizedItemUrl !== '/' && normalizedCurrentUrl.startsWith(normalizedItemUrl)) {
                return true;
            }

            return false;
        },
        [page.url],
    );

    // Рендеринг пункта мобильного нижнего меню
    const renderMobileBottomMenuItem = useCallback(
        (item: MenuItem) => {
            const iconPath = getMobileMenuIcon(item.url);
            const isActive = !item.target && isActiveMenuItem(item.url);
            const isExternal = item.target === '_blank' || !isInternalLink(item.url);

            const linkContent = (
                <>
                    <div className="mobile-menu-item__icon-wrapper">
                        {iconPath ? (
                            <img
                                src={iconPath}
                                alt={item.title}
                                className={`mobile-menu-item__icon ${isActive ? 'mobile-menu-item__icon--active' : ''}`}
                            />
                        ) : (
                            <div className={`mobile-menu-item__icon-placeholder ${isActive ? 'mobile-menu-item__icon-placeholder--active' : ''}`} />
                        )}
                    </div>
                    <span className={`mobile-menu-item__label ${isActive ? 'mobile-menu-item__label--active' : ''}`}>
                        {item.title}
                    </span>
                </>
            );

            return (
                <li key={item.id} className="mobile-menu-item">
                    {isExternal ? (
                        <a
                            href={item.url}
                            target={item.target}
                            rel="noopener noreferrer"
                            className="mobile-menu-item__link"
                        >
                            {linkContent}
                        </a>
                    ) : (
                        <Link
                            href={item.url}
                            className="mobile-menu-item__link"
                        >
                            {linkContent}
                        </Link>
                    )}
                </li>
            );
        },
        [isActiveMenuItem],
    );

    return (
        <nav
            className={`mobile-bottom-menu ${className || ''}`}
            style={style}
        >
            <ul className="mobile-bottom-menu__list">
                {sortedItems.map((item) => renderMobileBottomMenuItem(item))}
            </ul>
        </nav>
    );
};

