import FooterMenu from '@/components/Menu/FooterMenu';
import HeaderMenu from '@/components/Menu/HeaderMenu';
import MobileMenu from '@/components/Menu/MobileMenu';
import SidebarMenu from '@/components/Menu/SidebarMenu';
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

interface Menu {
    id: number;
    name: string;
    location: 'header' | 'footer' | 'sidebar' | 'mobile';
    is_active: boolean;
    css_classes?: string[];
    description?: string;
    items: MenuItem[];
}

interface MenuDisplayProps {
    organizationId: number;
    menus: Menu[];
    className?: string;
}

const MenuDisplay: React.FC<MenuDisplayProps> = ({
    organizationId,
    menus,
    className = '',
}) => {
    return (
        <div className={`menu-display ${className}`}>
            {/* Header Menu */}
            <HeaderMenu
                organizationId={organizationId}
                menus={menus}
                className="header-menu-wrapper"
            />

            {/* Footer Menu */}
            <FooterMenu
                organizationId={organizationId}
                menus={menus}
                className="footer-menu-wrapper"
            />

            {/* Sidebar Menu */}
            <SidebarMenu
                organizationId={organizationId}
                menus={menus}
                className="sidebar-menu-wrapper"
            />

            {/* Mobile Menu */}
            <MobileMenu
                organizationId={organizationId}
                menus={menus}
                className="mobile-menu-wrapper"
            />
        </div>
    );
};

export default MenuDisplay;
