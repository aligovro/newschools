import React from 'react';
import MenuRenderer from './MenuRenderer';

interface SidebarMenuProps {
    organizationId: number;
    className?: string;
    menus?: any[];
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
    organizationId,
    className = '',
    menus = [],
}) => {
    return (
        <div className={`sidebar-menu ${className}`}>
            <MenuRenderer
                organizationId={organizationId}
                location="sidebar"
                className="sidebar-menu-content"
                menus={menus}
            />
        </div>
    );
};

export default SidebarMenu;
