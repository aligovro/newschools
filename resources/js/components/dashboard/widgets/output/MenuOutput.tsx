import { isInternalLink } from '@/lib/linkUtils';
import { Link } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { MobileBottomMenu } from './MobileBottomMenu';
import { MobileMenuModal } from './MobileMenuModal';
import { MenuItem, MenuOutputConfig, WidgetOutputProps } from './types';

export const MenuOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as MenuOutputConfig;

    const {
        title = '',
        show_title = true, // По умолчанию true для обратной совместимости
        items = [],
        orientation = 'row',
        style: menuStyle = 'default',
    } = config;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isVertical = orientation === 'column';

    // Проверяем, является ли это мобильным нижним меню
    const isMobileBottomMenu = useMemo(() => {
        const wrapperClass =
            (widget as Record<string, unknown>)?.wrapper_class || '';
        return (
            wrapperClass === 'mobile-menu' || className?.includes('mobile-menu')
        );
    }, [widget, className]);

    // Если это мобильное нижнее меню и есть элементы, рендерим специальную версию
    if (isMobileBottomMenu) {
        if (!items || items.length === 0) {
            return (
                <div
                    className={`menu-output menu-output--empty ${className || ''}`}
                    style={style}
                >
                    <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <span className="text-gray-500">Меню не настроено</span>
                    </div>
                </div>
            );
        }
        return (
            <MobileBottomMenu
                items={items}
                className={className}
                style={style}
            />
        );
    }

    if (!items || items.length === 0) {
        return (
            <div
                className={`menu-output menu-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">Меню не настроено</span>
                </div>
            </div>
        );
    }

    const getOrientationClasses = (orientation: string) => {
        switch (orientation) {
            case 'column':
                return 'flex-col space-y-2';
            case 'row':
            default:
                return 'flex-row';
        }
    };

    const getStyleClasses = (style: string) => {
        switch (style) {
            case 'minimal':
                return 'menu-minimal';
            case 'modern':
                return 'menu-modern';
            case 'default':
            default:
                return 'menu-default';
        }
    };

    const renderMenuItem = (item: MenuItem, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExternal =
            item.target === '_blank' || !isInternalLink(item.url);
        const linkClassName =
            'menu-link block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600';

        return (
            <li key={item.id} className={`menu-item menu-item--level-${level}`}>
                {isExternal ? (
                    <a
                        href={item.url}
                        target={item.target}
                        rel="noopener noreferrer"
                        className={linkClassName}
                    >
                        {item.title}
                        <svg
                            className="ml-1 inline h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </a>
                ) : (
                    <Link href={item.url} className={linkClassName}>
                        {item.title}
                    </Link>
                )}
                {hasChildren && (
                    <ul className="submenu ml-4 mt-2 space-y-1">
                        {item.children!.map((child) =>
                            renderMenuItem(child, level + 1),
                        )}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <nav
            className={`menu-output ${getStyleClasses(menuStyle)} ${className || ''}`}
            style={style}
        >
            {title && show_title && (
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    {title}
                </h2>
            )}

            {/* Mobile menu button - только для горизонтального меню */}
            {!isVertical && (
                <>
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="menu-mobile-toggle-button"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Модальное мобильное меню */}
                    <MobileMenuModal
                        items={items}
                        isOpen={isMobileMenuOpen}
                        onOpenChange={setIsMobileMenuOpen}
                        title={title && show_title ? title : undefined}
                    />
                </>
            )}

            {/* Desktop menu - скрывается на мобильных только для горизонтального меню */}
            <ul
                className={`${isVertical ? 'flex' : 'hidden md:flex'} ${getOrientationClasses(orientation)}`}
            >
                {items.map((item) => renderMenuItem(item))}
            </ul>
        </nav>
    );
};
