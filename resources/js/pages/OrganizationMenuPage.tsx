import MenuManager from '@/components/Menu/MenuManager';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface MenuItem {
    id: number;
    title: string;
    url?: string;
    route_name?: string;
    external_url?: string;
    page_id?: number;
    icon?: string;
    css_classes?: string[];
    sort_order: number;
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

interface OrganizationMenuPageProps {
    organization: Organization;
    menus: Menu[];
    locations: Record<string, string>;
    pages: Array<{ id: number; title: string; slug: string }>;
    types: Record<string, string>;
}

const OrganizationMenuPage: React.FC<OrganizationMenuPageProps> = ({
    organization,
    menus,
    locations,
    pages,
    types,
}) => {
    return (
        <AuthenticatedLayout>
            <Head title={`Меню - ${organization.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Управление меню
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Создавайте и настраивайте меню для
                                    организации "{organization.name}"
                                </p>
                            </div>

                            <MenuManager
                                organizationId={organization.id}
                                menus={menus}
                                locations={locations}
                                pages={pages}
                                types={types}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default OrganizationMenuPage;
