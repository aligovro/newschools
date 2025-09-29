import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import MenuRenderer from './MenuRenderer';

interface MobileMenuProps {
    organizationId: number;
    className?: string;
    menus?: any[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({
    organizationId,
    className = '',
    menus = [],
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`mobile-menu ${className}`}>
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="mobile-menu-toggle"
                aria-label="Открыть меню"
            >
                {isOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <Menu className="h-5 w-5" />
                )}
            </Button>

            {isOpen && (
                <div className="mobile-menu-overlay">
                    <div className="mobile-menu-content">
                        <MenuRenderer
                            organizationId={organizationId}
                            location="mobile"
                            className="mobile-menu-list"
                            menus={menus}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileMenu;
