import React, { useState } from 'react';
import { MenuItem, MenuOutputConfig, WidgetOutputProps } from './types';

export const MenuOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as MenuOutputConfig;

    const {
        title = '',
        items = [],
        orientation = 'row',
        style: menuStyle = 'default',
    } = config;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                return 'flex-row space-x-8';
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
        const isExternal = item.target === '_blank';

        return (
            <li key={item.id} className={`menu-item menu-item--level-${level}`}>
                <a
                    href={item.url}
                    target={item.target}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="menu-link block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
                >
                    {item.title}
                    {isExternal && (
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
                    )}
                </a>
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
            {title && (
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    {title}
                </h2>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    aria-label="Toggle menu"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isMobileMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Desktop menu */}
            <ul
                className={`hidden md:flex ${getOrientationClasses(orientation)}`}
            >
                {items.map((item) => renderMenuItem(item))}
            </ul>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <ul
                        className={`mt-2 space-y-1 rounded-md border border-gray-200 bg-white p-2 ${getOrientationClasses('column')}`}
                    >
                        {items.map((item) => renderMenuItem(item))}
                    </ul>
                </div>
            )}
        </nav>
    );
};
