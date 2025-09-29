import React from 'react';
import OrganizationMenu from './OrganizationMenu';

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

interface MenuRendererProps {
    organizationId: number;
    location: 'header' | 'footer' | 'sidebar' | 'mobile';
    className?: string;
    menus?: Menu[];
}

const MenuRenderer: React.FC<MenuRendererProps> = ({
    organizationId,
    location,
    className = '',
    menus = [],
}) => {
    const [menu, setMenu] = React.useState<Menu | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Если меню уже переданы как пропс, используем их
        if (menus.length > 0) {
            const foundMenu = menus.find(
                (m) => m.location === location && m.is_active,
            );
            setMenu(foundMenu || null);
            setLoading(false);
            return;
        }

        // Иначе загружаем меню через API
        const fetchMenu = async () => {
            try {
                const response = await fetch(
                    `/api/organizations/${organizationId}/menus/${location}`,
                );
                if (response.ok) {
                    const data = await response.json();
                    setMenu(data.menu);
                }
            } catch (error) {
                console.error('Error fetching menu:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [organizationId, location, menus]);

    if (loading) {
        return (
            <div className={`menu-loading ${className}`}>
                <div className="animate-pulse">
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                </div>
            </div>
        );
    }

    if (!menu) {
        return null;
    }

    return <OrganizationMenu menu={menu} className={className} />;
};

export default MenuRenderer;
