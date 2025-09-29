import { AppHeader } from '@/components/common/layout/app-header';
import { AppSidebar } from '@/components/common/layout/app-sidebar';
import { Head } from '@inertiajs/react';

interface Organization {
    id: number;
    name: string;
    slug: string;
    domain?: string;
}

interface OrganizationAdminLayoutProps {
    organization: Organization;
    children: React.ReactNode;
    title?: string;
}

export default function OrganizationAdminLayout({
    organization,
    children,
    title = 'Админка',
}: OrganizationAdminLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <Head title={`${title} - ${organization.name}`} />

            <div className="flex h-screen">
                {/* Sidebar */}
                <AppSidebar
                    organization={organization}
                    className="w-64 border-r"
                />

                {/* Main Content */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <AppHeader
                        organization={organization}
                        className="border-b"
                    />

                    <main className="flex-1 overflow-auto p-6">
                        <div className="mx-auto max-w-7xl">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
}
