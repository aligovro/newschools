import React from 'react';
import MenuRenderer from './MenuRenderer';

interface FooterMenuProps {
    organizationId: number;
    className?: string;
    menus?: any[];
}

const FooterMenu: React.FC<FooterMenuProps> = ({
    organizationId,
    className = '',
    menus = [],
}) => {
    return (
        <div className={`footer-menu ${className}`}>
            <MenuRenderer
                organizationId={organizationId}
                location="footer"
                className="footer-menu-content"
                menus={menus}
            />
        </div>
    );
};

export default FooterMenu;
