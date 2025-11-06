import { AppContent } from '@/components/common/layout/app-content';
import { AppShell } from '@/components/common/layout/app-shell';
import { AppSidebar } from '@/components/common/layout/app-sidebar';
import { AppSidebarHeader } from '@/components/common/layout/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, type ReactNode } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    headerActions,
}: PropsWithChildren<{
    breadcrumbs?: BreadcrumbItem[];
    headerActions?: ReactNode;
}>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader
                    breadcrumbs={breadcrumbs}
                    actions={headerActions}
                />
                {children}
            </AppContent>
        </AppShell>
    );
}
