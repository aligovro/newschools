import { Link } from '@inertiajs/react';
import React from 'react';

interface MenuItem {
    id: number;
    title: string;
    url?: string;
    route_name?: string;
    external_url?: string;
    page_id?: number;
    icon?: string;
    css_classes?: string[];
    is_active: boolean;
    open_in_new_tab: boolean;
    children?: MenuItem[];
    final_url?: string;
    link_type?: string;
}

interface OrganizationMenuProps {
    menu: {
        id: number;
        name: string;
        location: 'header' | 'footer' | 'sidebar' | 'mobile';
        is_active: boolean;
        css_classes?: string[];
        items: MenuItem[];
    };
    className?: string;
}

const OrganizationMenu: React.FC<OrganizationMenuProps> = ({
    menu,
    className = '',
}) => {
    if (!menu || !menu.is_active || !menu.items?.length) {
        return null;
    }

    const renderMenuItem = (item: MenuItem, level: number = 0) => {
        if (!item.is_active) return null;

        const hasChildren = item.children && item.children.length > 0;
        const itemClasses = [
            'menu-item',
            `menu-item-level-${level}`,
            ...(item.css_classes || []),
            hasChildren ? 'has-children' : '',
        ]
            .filter(Boolean)
            .join(' ');

        const linkProps = {
            className: `menu-link ${itemClasses}`,
            target: item.open_in_new_tab ? '_blank' : undefined,
            rel: item.open_in_new_tab ? 'noopener noreferrer' : undefined,
        };

        const linkContent = (
            <>
                {item.icon && <i className={`menu-icon ${item.icon}`} />}
                <span className="menu-text">{item.title}</span>
                {hasChildren && <i className="menu-arrow" />}
            </>
        );

        let linkElement;

        if (item.external_url) {
            linkElement = (
                <a href={item.external_url} {...linkProps}>
                    {linkContent}
                </a>
            );
        } else if (item.final_url && item.final_url !== '#') {
            linkElement = (
                <Link href={item.final_url} {...linkProps}>
                    {linkContent}
                </Link>
            );
        } else {
            linkElement = (
                <span className={linkProps.className}>{linkContent}</span>
            );
        }

        return (
            <li key={item.id} className={itemClasses}>
                {linkElement}
                {hasChildren && (
                    <ul className={`submenu submenu-level-${level + 1}`}>
                        {item.children.map((child) =>
                            renderMenuItem(child, level + 1),
                        )}
                    </ul>
                )}
            </li>
        );
    };

    const menuClasses = [
        'organization-menu',
        `menu-${menu.location}`,
        ...(menu.css_classes || []),
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <nav className={menuClasses} role="navigation" aria-label={menu.name}>
            <ul className="menu-list">
                {menu.items.map((item) => renderMenuItem(item))}
            </ul>
        </nav>
    );
};

export default OrganizationMenu;
