import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    BarChart3,
    CreditCard,
    FileText,
    Globe,
    Image,
    LayoutDashboard,
    Menu,
    Settings,
    Users,
} from 'lucide-react';

interface Organization {
    id: number;
    name: string;
    slug: string;
    domain?: string;
}

interface OrganizationAdminSidebarProps {
    organization: Organization;
    className?: string;
}

const navigationItems = [
    {
        name: 'Панель управления',
        href: 'organization.admin.dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Меню',
        href: 'organization.admin.menus',
        icon: Menu,
    },
    {
        name: 'Страницы',
        href: 'organization.admin.pages',
        icon: FileText,
    },
    {
        name: 'Пользователи',
        href: 'organization.admin.users',
        icon: Users,
    },
    {
        name: 'Галерея',
        href: 'organization.admin.gallery',
        icon: Image,
    },
    {
        name: 'Платежи',
        href: 'organization.admin.payments',
        icon: CreditCard,
    },
    {
        name: 'Аналитика',
        href: 'organization.admin.analytics',
        icon: BarChart3,
    },
    {
        name: 'Настройки',
        href: 'organization.admin.settings',
        icon: Settings,
    },
];

export function OrganizationAdminSidebar({
    organization,
    className,
}: OrganizationAdminSidebarProps) {
    return (
        <div className={cn('bg-card flex h-full flex-col', className)}>
            {/* Organization Info */}
            <div className="border-b p-6">
                <div className="flex items-center space-x-3">
                    <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                        <Globe className="text-primary-foreground h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold">
                            {organization.name}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {organization.domain || organization.slug}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={route(item.href, organization.slug)}
                            className={cn(
                                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                'hover:bg-accent hover:text-accent-foreground',
                                'text-muted-foreground',
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t p-4">
                <Link
                    href={route('dashboard')}
                    className="hover:bg-accent hover:text-accent-foreground flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Главная панель</span>
                </Link>
            </div>
        </div>
    );
}
