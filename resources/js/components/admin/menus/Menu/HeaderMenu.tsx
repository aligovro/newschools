import React from 'react';
import MenuRenderer from './MenuRenderer';

interface HeaderMenuProps {
    organizationId: number;
    className?: string;
    menus?: any[];
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({
    organizationId,
    className = '',
    menus = [],
}) => {
    return (
        <div className={`header-menu ${className}`}>
            <MenuRenderer
                organizationId={organizationId}
                location="header"
                className="header-menu-content"
                menus={menus}
            />
        </div>
    );
};

export default HeaderMenu;
