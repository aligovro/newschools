import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Building2,
    Folder,
    Globe,
    LayoutGrid,
    Settings,
    Target,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { props } = usePage();
    const rawTerminology = (props as any).terminology;

    // Получаем plural_nominative с поддержкой разных форматов
    const getPluralNominative = () => {
        if (!rawTerminology) {
            return 'Организации';
        }

        // Проверяем разные варианты структуры
        if (rawTerminology.organization?.plural_nominative) {
            return rawTerminology.organization.plural_nominative;
        }
        if (rawTerminology.plural_nominative) {
            return rawTerminology.plural_nominative;
        }

        return 'Организации';
    };

    const organizationsTitle = getPluralNominative();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Пользователи',
            href: '/dashboard/users',
            icon: Users,
        },
        {
            title: organizationsTitle,
            href: '/dashboard/organizations',
            icon: Building2,
        },
        {
            title: 'Проекты',
            href: '/dashboard/projects',
            icon: Target,
        },
        {
            title: 'Сайты',
            href: '/dashboard/sites',
            icon: Globe,
        },
        {
            title: 'Статистика',
            href: '/dashboard/statistics',
            icon: BarChart3,
        },
        {
            title: 'Настройки',
            href: '/dashboard/settings',
            icon: Settings,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
